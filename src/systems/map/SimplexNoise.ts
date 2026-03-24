/**
 * Simplex Noise 实现
 * 用于地形生成的噪声算法
 *
 * @module systems/map/SimplexNoise
 */

/**
 * Simplex Noise 类
 * 基于 Perlin noise 的改进算法，生成更自然的噪声
 */
export class SimplexNoise {
  private grad3: number[][] = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];

  private p: number[] = [];
  private perm: number[] = [];
  private permMod12: number[] = [];

  private F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  private G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  /**
   * 创建 SimplexNoise 实例
   * @param seed - 随机种子字符串
   */
  constructor(seed?: string) {
    // 初始化置换表
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }

    // 使用种子打乱置换表
    if (seed) {
      const seedNum = this.hashString(seed);
      this.shuffleWithSeed(seedNum);
    } else {
      this.shuffleWithSeed(Math.random() * 65536);
    }

    // 扩展置换表
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  /**
   * 字符串哈希
   * @param str - 输入字符串
   * @returns 哈希值
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * 使用种子打乱数组
   * @param seed - 种子值
   */
  private shuffleWithSeed(seed: number): void {
    let currentIndex = 256;
    let temporaryValue: number;
    let randomIndex: number;

    // Fisher-Yates shuffle with seeded random
    while (currentIndex !== 0) {
      // Seeded random
      seed = (seed * 9301 + 49297) % 233280;
      randomIndex = Math.floor((seed / 233280) * currentIndex);
      currentIndex -= 1;

      temporaryValue = this.p[currentIndex];
      this.p[currentIndex] = this.p[randomIndex];
      this.p[randomIndex] = temporaryValue;
    }
  }

  /**
   * 计算点积
   * @param g - 梯度向量
   * @param x - x坐标
   * @param y - y坐标
   * @returns 点积值
   */
  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  /**
   * 2D Simplex Noise
   * @param xin - x输入
   * @param yin - y输入
   * @returns 噪声值 (-1 到 1)
   */
  noise2D(xin: number, yin: number): number {
    let n0: number, n1: number, n2: number; // Noise contributions from the three corners

    // Skew the input space to determine which simplex cell we're in
    const s = (xin + yin) * this.F2; // Hairy factor for 2D
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * this.G2;
    const X0 = i - t; // Unskew the cell origin back to (x,y) space
    const Y0 = j - t;
    const x0 = xin - X0; // The x,y distances from the cell origin
    const y0 = yin - Y0;

    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    let i1: number, j1: number; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    const x1 = x0 - i1 + this.G2; // Offsets for middle corner in (x,y) unskewed coords
    const y1 = y0 - j1 + this.G2;
    const x2 = x0 - 1.0 + 2.0 * this.G2; // Offsets for last corner in (x,y) unskewed coords
    const y2 = y0 - 1.0 + 2.0 * this.G2;

    // Work out the hashed gradient indices of the three simplex corners
    const ii = i & 255;
    const jj = j & 255;

    // Calculate the contribution from the three corners
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0.0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[this.permMod12[ii + this.perm[jj]]], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0.0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[this.permMod12[ii + i1 + this.perm[jj + j1]]], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0.0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[this.permMod12[ii + 1 + this.perm[jj + 1]]], x2, y2);
    }

    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
  }

  /**
   * 2D 分形噪声 (多层叠加)
   * @param x - x坐标
   * @param y - y坐标
   * @param octaves - 八度数
   * @param persistence - 持久度
   * @param lacunarity - 空隙度
   * @returns 噪声值 (-1 到 1)
   */
  fractal2D(
    x: number,
    y: number,
    octaves: number = 4,
    persistence: number = 0.5,
    lacunarity: number = 2.0
  ): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;  // Used for normalizing result to 0.0 - 1.0

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}
