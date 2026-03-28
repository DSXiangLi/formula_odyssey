/**
 * Spirit Image Service
 * 药灵山谷v3.0 AI药灵形象生成服务 - 使用Seedream API生成拟人化药灵形象
 */

import { Medicine } from '../../types/medicine';

// 特定药材的特征描述映射
const MEDICINE_CHARACTER_DESCRIPTIONS: Record<string, string> = {
  // 第一章常用药材
  danggui: '温柔如水的女子形象，手持当归根茎，身穿淡紫色长裙，散发温暖柔和的气息',
  chuanxiong: '英姿飒爽的女侠形象，头插川芎花，身着青衣，手持药锄，气质灵动飘逸',
  huangqi: '沉稳可靠的战士形象，身披金色铠甲，手持黄芪根茎化作的长枪，正气凛然',
  baishao: '优雅端庄的仙子形象，一袭白衣，手持白芍花枝，气质清冷高洁',
  shoudi: '深沉稳重的长者形象，身着玄色长袍，手持熟地黑块，周身环绕温润黑光',
  // 常见药材通用描述
  renshen: '仙风道骨的老者形象，头顶人参花冠，手持千年人参，周身散发金色灵气',
  gancao: '和蔼可亲的孩童形象，头系甘草花环，笑容甜美，手持甘草棒',
  huanglian: '冷峻严肃的剑客形象，身着黄绿色劲装，手持黄连双剑，气质苦寒刚毅',
  huangqin: '冷静理智的学者形象，身着靛青色长衫，手持黄芩书卷，目光深邃',
  longdan: '刚直不阿的将军形象，身披青色战甲，手持龙胆长枪，气势如虹',
  // 补益类
  dangshen: '温婉贤淑的医女形象，手持党参药囊，身着淡粉色衣裙，气质温和',
  baizhu: '朴实勤劳的农夫形象，腰系白术束带，手持药锄，笑容憨厚',
  fuling: '纯净可爱的小精灵形象，身体半透明如茯苓质地，散发淡淡荧光',
  gouteng: '灵动飘逸的刺客形象，身着钩藤编织的轻甲，手持双钩，身手敏捷',
  // 活血化瘀类
  taoren: '坚毅果敢的女将形象，手持桃仁双刀，身着暗红色战衣，英气逼人',
  honghua: '热情似火的舞者形象，身披红花织就的纱衣，手持红花长绸，舞姿曼妙',
  yimucao: '慈爱温柔的母性形象，身着碧绿色长裙，手持益母草，散发生命气息',
  // 理气类
  chenpi: '睿智豁达的老者形象，身着橘黄色长袍，手持陈皮折扇，笑容可掬',
  xiangfu: '优雅从容的琴师形象，手持香附化作的古琴，气质高雅，琴声悠扬',
  zhiqiao: '活泼开朗的少女形象，身着明黄色衣裙，手持枳壳灯笼，笑容明媚',
  // 祛湿类
  yiyiren: '清纯灵动的村姑形象，手持薏苡珠串，身着白色布衣，气质纯净',
  cheqianzi: '勤劳坚韧的车夫形象，手持车前草鞭，身着褐色短打，朴实可靠',
  huoxiang: '清新怡人的香妃形象，手持藿香团扇，身着绿白相间长裙，香气袭人',
  // 解表类
  bohe: '清爽宜人的少女形象，手持薄荷叶，身着薄荷绿轻纱，气质清凉',
  guizhi: '温暖如春的女子形象，手持桂枝，身着淡粉色衣裙，散发桂枝香气',
  // 默认描述
  default: '神秘的草药精灵形象，身着传统中式服装，周身环绕自然灵气，气质超凡脱俗',
};

// 难度对应的风格描述
interface DifficultyStyle {
  prefix: string;
  suffix: string;
  size: { width: number; height: number };
}

const DIFFICULTY_STYLE_DESCRIPTIONS: Record<string, DifficultyStyle> = {
  normal: {
    prefix: 'Cute chibi style, adorable and friendly appearance, big sparkling eyes, soft pastel colors, kawaii aesthetic, rounded features',
    suffix: 'cute chibi character, game sprite, white background, 4K, highly detailed',
    size: { width: 512, height: 512 },
  },
  elite: {
    prefix: 'Elegant and refined style, graceful posture, sophisticated design, flowing robes, intricate details, noble bearing',
    suffix: 'elegant character portrait, new Chinese style, detailed costume design, 4K, masterpiece',
    size: { width: 1024, height: 1024 },
  },
  boss: {
    prefix: 'Majestic and powerful style, imposing presence, dramatic lighting, epic composition, awe-inspiring aura, legendary quality',
    suffix: 'mythical guardian spirit, cinematic lighting, grand scale, 4K, masterpiece, ultra detailed',
    size: { width: 1024, height: 1024 },
  },
};

export class SpiritImageService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly model: string;
  private imageCache: Map<string, string> = new Map();

  constructor(config?: { apiUrl?: string; apiKey?: string; model?: string }) {
    this.apiUrl = config?.apiUrl || import.meta.env.VITE_SEED_IMAGE_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
    this.apiKey = config?.apiKey || import.meta.env.VITE_SEED_IMAGE_KEY || '';
    this.model = config?.model || import.meta.env.VITE_SEED_MODEL_NAME || 'doubao-seedream-4-5-251128';
  }

  /**
   * 生成单个药灵形象
   * @param medicine 药材数据
   * @param difficulty 难度等级: normal(普通), elite(精英), boss(Boss)
   * @returns 生成的图片URL，失败返回null
   */
  async generateSpiritImage(
    medicine: Medicine,
    difficulty: 'normal' | 'elite' | 'boss'
  ): Promise<string | null> {
    const cacheKey = `${medicine.id}_${difficulty}`;

    // 检查缓存
    const cached = this.imageCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 检查API配置
    if (!this.apiKey) {
      console.warn('Seedream API key not configured, using fallback SVG');
      const fallbackUrl = this.generateFallbackSvg(medicine, difficulty);
      this.imageCache.set(cacheKey, fallbackUrl);
      return fallbackUrl;
    }

    try {
      const prompt = this.buildPrompt(medicine, difficulty);
      const style = DIFFICULTY_STYLE_DESCRIPTIONS[difficulty];

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          width: style.size.width,
          height: style.size.height,
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spirit image generation failed:', errorText);
        // API失败时返回占位图
        const fallbackUrl = this.generateFallbackSvg(medicine, difficulty);
        this.imageCache.set(cacheKey, fallbackUrl);
        return fallbackUrl;
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json || null;

      if (imageUrl) {
        this.imageCache.set(cacheKey, imageUrl);
      }

      return imageUrl;
    } catch (error) {
      console.error('Spirit image generation error:', error);
      // 异常时返回占位图
      const fallbackUrl = this.generateFallbackSvg(medicine, difficulty);
      this.imageCache.set(cacheKey, fallbackUrl);
      return fallbackUrl;
    }
  }

  /**
   * 批量生成药灵形象
   * @param medicines 药材数组
   * @param difficulty 难度等级
   * @returns 药材ID到图片URL的映射
   */
  async generateSpiritImages(
    medicines: Medicine[],
    difficulty: 'normal' | 'elite' | 'boss'
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const medicine of medicines) {
      console.log(`Generating spirit image for ${medicine.name}...`);
      const imageUrl = await this.generateSpiritImage(medicine, difficulty);
      if (imageUrl) {
        results[medicine.id] = imageUrl;
      }

      // 添加延迟以避免速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * 清空图片缓存
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.imageCache.size;
  }

  /**
   * 检查缓存中是否存在指定key
   */
  hasCache(medicineId: string, difficulty: string): boolean {
    return this.imageCache.has(`${medicineId}_${difficulty}`);
  }

  /**
   * 构建生成提示词
   */
  private buildPrompt(medicine: Medicine, difficulty: 'normal' | 'elite' | 'boss'): string {
    const characterDesc = this.getCharacterDescription(medicine);
    const style = DIFFICULTY_STYLE_DESCRIPTIONS[difficulty];

    return `${style.prefix}, ${characterDesc}, traditional Chinese fantasy style, anthropomorphic herb spirit, ${style.suffix}`;
  }

  /**
   * 获取药灵角色描述
   */
  private getCharacterDescription(medicine: Medicine): string {
    // 尝试直接匹配药材ID
    if (MEDICINE_CHARACTER_DESCRIPTIONS[medicine.id]) {
      return MEDICINE_CHARACTER_DESCRIPTIONS[medicine.id];
    }

    // 尝试匹配拼音（如果id不匹配）
    const pinyinLower = medicine.pinyin.toLowerCase().replace(/\s+/g, '');
    if (MEDICINE_CHARACTER_DESCRIPTIONS[pinyinLower]) {
      return MEDICINE_CHARACTER_DESCRIPTIONS[pinyinLower];
    }

    // 尝试从名称中匹配关键词
    const name = medicine.name;
    for (const [key, desc] of Object.entries(MEDICINE_CHARACTER_DESCRIPTIONS)) {
      if (name.includes(key) || key.includes(name)) {
        return desc;
      }
    }

    // 根据药材功效生成通用描述
    return this.generateGenericDescription(medicine);
  }

  /**
   * 生成通用药灵描述
   */
  private generateGenericDescription(medicine: Medicine): string {
    const wuxingDesc: Record<string, string> = {
      wood: '木系气质，生机勃勃，身着青绿色服饰',
      fire: '火系气质，热情奔放，身着红色服饰',
      earth: '土系气质，沉稳厚重，身着黄色服饰',
      metal: '金系气质，清冷锐利，身着白色服饰',
      water: '水系气质，柔和灵动，身着黑色或深蓝色服饰',
    };

    const wuxing = medicine.wuxing || 'wood';
    const baseDesc = wuxingDesc[wuxing] || wuxingDesc.wood;

    // 根据四气调整气质
    const fourQiAdj: Record<string, string> = {
      hot: '热情似火，气场强大',
      warm: '温暖如春，亲切可人',
      cool: '清凉如秋，沉静优雅',
      cold: '冷峻如冬，气质高洁',
    };

    const qiAdj = fourQiAdj[medicine.fourQi] || '';

    return `拟人化的${medicine.name}药灵，${baseDesc}，${qiAdj}，${medicine.functions[0] || '守护药材之力'}，传统中式服装设计`;
  }

  /**
   * 生成降级SVG占位图
   */
  private generateFallbackSvg(medicine: Medicine, difficulty: 'normal' | 'elite' | 'boss'): string {
    // 根据难度选择emoji和颜色
    const emojiMap: Record<string, Record<string, { emoji: string; bgColor: string }>> = {
      normal: {
        wood: { emoji: '🌱', bgColor: '#E8F5E9' },
        fire: { emoji: '🔥', bgColor: '#FFEBEE' },
        earth: { emoji: '🌾', bgColor: '#FFF8E1' },
        metal: { emoji: '⚔️', bgColor: '#ECEFF1' },
        water: { emoji: '💧', bgColor: '#E3F2FD' },
      },
      elite: {
        wood: { emoji: '🌿', bgColor: '#C8E6C9' },
        fire: { emoji: '🔥', bgColor: '#FFCDD2' },
        earth: { emoji: '🌾', bgColor: '#FFECB3' },
        metal: { emoji: '⚔️', bgColor: '#CFD8DC' },
        water: { emoji: '💧', bgColor: '#BBDEFB' },
      },
      boss: {
        wood: { emoji: '🌳', bgColor: '#A5D6A7' },
        fire: { emoji: '🔥', bgColor: '#EF9A9A' },
        earth: { emoji: '⛰️', bgColor: '#FFE082' },
        metal: { emoji: '👑', bgColor: '#B0BEC5' },
        water: { emoji: '🌊', bgColor: '#90CAF9' },
      },
    };

    const wuxing = medicine.wuxing || 'wood';
    const { emoji, bgColor } = emojiMap[difficulty][wuxing] || emojiMap.normal.wood;

    // 构建SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="${bgColor}" rx="20"/>
        <text x="100" y="100" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
        <text x="100" y="160" font-size="16" text-anchor="middle" fill="#333" font-family="sans-serif">${medicine.name}</text>
        <text x="100" y="180" font-size="12" text-anchor="middle" fill="#666" font-family="sans-serif">${difficulty === 'normal' ? '普通' : difficulty === 'elite' ? '精英' : 'Boss'}</text>
      </svg>
    `.trim();

    // 转换为data URL
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }
}

// 单例导出
export const spiritImageService = new SpiritImageService();
