import React, { useCallback, useRef, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { GameMap, Tile, Position } from '../../systems/map/types';
import { WuxingType } from '../../types';

interface IsometricMapProps {
  map: GameMap;
  playerPosition: Position;
  onTileClick: (tile: Tile) => void;
  tileWidth?: number;
  tileHeight?: number;
  wuxing?: WuxingType;
}

// 五行主题配置
const WUXING_THEMES: Record<WuxingType, {
  background: string;
  solidBackground: string;
  ambientColor: string;
  lightColor: string;
  particleColor: string;
  terrainColors: Record<string, string>;
}> = {
  [WuxingType.Wood]: {
    // 青木林 - 翠绿竹林氛围
    background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
    solidBackground: '#C8E6C9',
    ambientColor: 'rgba(46, 125, 50, 0.15)',
    lightColor: 'rgba(255, 255, 255, 0.4)',
    particleColor: '#81C784',
    terrainColors: {
      plains: '#9CCC65',
      forest: '#66BB6A',
      mountain: '#6D4C41',
      water: '#42A5F5',
      marsh: '#78909C',
      cave: '#424242',
      cliff: '#8D6E63',
    },
  },
  [WuxingType.Fire]: {
    // 赤焰峰 - 炽热岩浆氛围
    background: 'linear-gradient(180deg, #FFEBEE 0%, #FFCDD2 50%, #EF9A9A 100%)',
    solidBackground: '#FFCDD2',
    ambientColor: 'rgba(198, 40, 40, 0.2)',
    lightColor: 'rgba(255, 200, 100, 0.5)',
    particleColor: '#FF7043',
    terrainColors: {
      plains: '#FF8A65',
      forest: '#D84315',
      mountain: '#BF360C',
      water: '#FF5722',
      marsh: '#E64A19',
      cave: '#3E2723',
      cliff: '#DD2C00',
    },
  },
  [WuxingType.Earth]: {
    // 黄土丘 - 金黄麦田氛围
    background: 'linear-gradient(180deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)',
    solidBackground: '#FFECB3',
    ambientColor: 'rgba(249, 168, 37, 0.15)',
    lightColor: 'rgba(255, 255, 200, 0.4)',
    particleColor: '#FFD54F',
    terrainColors: {
      plains: '#E6C875',
      forest: '#8D6E63',
      mountain: '#5D4037',
      water: '#795548',
      marsh: '#A1887F',
      cave: '#4E342E',
      cliff: '#6D4C41',
    },
  },
  [WuxingType.Metal]: {
    // 白金原 - 冰雪金属氛围
    background: 'linear-gradient(180deg, #ECEFF1 0%, #CFD8DC 50%, #B0BEC5 100%)',
    solidBackground: '#CFD8DC',
    ambientColor: 'rgba(120, 144, 156, 0.15)',
    lightColor: 'rgba(255, 255, 255, 0.6)',
    particleColor: '#90A4AE',
    terrainColors: {
      plains: '#CFD8DC',
      forest: '#90A4AE',
      mountain: '#607D8B',
      water: '#78909C',
      marsh: '#B0BEC5',
      cave: '#455A64',
      cliff: '#546E7A',
    },
  },
  [WuxingType.Water]: {
    // 黑水潭 - 幽深水域氛围
    background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
    solidBackground: '#BBDEFB',
    ambientColor: 'rgba(21, 101, 192, 0.15)',
    lightColor: 'rgba(200, 230, 255, 0.5)',
    particleColor: '#4FC3F7',
    terrainColors: {
      plains: '#81D4FA',
      forest: '#4FC3F7',
      mountain: '#0288D1',
      water: '#039BE5',
      marsh: '#29B6F6',
      cave: '#01579B',
      cliff: '#0277BD',
    },
  },
};

// 粒子类
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = Math.random() * 0.5 + 0.2;
    this.size = Math.random() * 3 + 2;
    this.alpha = Math.random() * 0.5 + 0.3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    if (this.y > canvasHeight) {
      this.y = -10;
      this.x = Math.random() * canvasWidth;
    }
    if (this.x > canvasWidth) this.x = 0;
    if (this.x < 0) this.x = canvasWidth;
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = color;
    ctx.globalAlpha = this.alpha;

    // 绘制竹叶形状
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// 光斑类
class LightSpot {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.radius = Math.random() * 30 + 20;
    this.alpha = Math.random() * 0.2 + 0.1;
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.pulsePhase += this.pulseSpeed;
    this.alpha = 0.15 + Math.sin(this.pulsePhase) * 0.05;
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    gradient.addColorStop(0, color.replace('0.4', String(this.alpha)));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 调整颜色亮度
function adjustColorBrightness(hexColor: string, percent: number): string {
  const num = parseInt(hexColor.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export const IsometricMap: React.FC<IsometricMapProps> = ({
  map,
  playerPosition,
  onTileClick,
  tileWidth = 64,
  tileHeight = 32,
  wuxing = WuxingType.Wood,
}) => {
  const particlesRef = useRef<Particle[]>([]);
  const lightSpotsRef = useRef<LightSpot[]>([]);
  const animationRef = useRef<number>(0);

  const theme = WUXING_THEMES[wuxing];
  const terrainColors = theme.terrainColors;

  // 初始化粒子和光斑
  useEffect(() => {
    particlesRef.current = Array.from({ length: 30 }, () => new Particle(800, 600));
    lightSpotsRef.current = Array.from({ length: 8 }, () => new LightSpot(800, 600));
  }, []);

  const worldToScreen = (x: number, y: number): { x: number; y: number } => {
    const screenX = (x - y) * tileWidth / 2 + 400;
    const screenY = (x + y) * tileHeight / 2 + 200;
    return { x: screenX, y: screenY };
  };

  const screenToWorld = (screenX: number, screenY: number): Position => {
    const x = (screenX - 400) / (tileWidth / 2);
    const y = (screenY - 200) / (tileHeight / 2);
    return { x: Math.round((x + y) / 2), y: Math.round((y - x) / 2) };
  };

  const render = useCallback((ctx: CanvasRenderingContext2D, deltaTime: number) => {
    // 清空画布
    ctx.clearRect(0, 0, 800, 600);

    // 绘制主题背景色（纯色背景）
    ctx.fillStyle = theme.solidBackground;
    ctx.fillRect(0, 0, 800, 600);

    // 绘制环境氛围叠加（半透明）
    ctx.fillStyle = theme.ambientColor;
    ctx.fillRect(0, 0, 800, 600);

    // 绘制光斑（在地图下方）
    lightSpotsRef.current.forEach(spot => {
      spot.update();
      spot.draw(ctx, theme.lightColor);
    });

    // 收集并排序地块
    const tiles: Tile[] = [];
    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        tiles.push(map.tiles[y][x]);
      }
    }
    tiles.sort((a, b) => (a.position.x + a.position.y) - (b.position.x + b.position.y));

    // 绘制地块
    tiles.forEach(tile => {
      const pos = worldToScreen(tile.position.x, tile.position.y);
      renderTile(ctx, tile, pos.x, pos.y);
    });

    // 绘制玩家
    const playerPos = worldToScreen(playerPosition.x, playerPosition.y);
    renderPlayer(ctx, playerPos.x, playerPos.y);

    // 绘制雾气效果
    renderFogEffect(ctx);

    // 绘制粒子（在最上层）
    particlesRef.current.forEach(particle => {
      particle.update(800, 600);
      particle.draw(ctx, theme.particleColor);
    });
  }, [map, playerPosition, tileWidth, tileHeight, theme]);

  const renderTile = (ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number) => {
    const isHidden = tile.discoveryState === 'hidden';
    const baseColor = isHidden ? '#1a1a2e' : terrainColors[tile.terrain] || terrainColors.plains;

    // 绘制地块顶面
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(x, y - tileHeight / 2);
    ctx.lineTo(x + tileWidth / 2, y);
    ctx.lineTo(x, y + tileHeight / 2);
    ctx.lineTo(x - tileWidth / 2, y);
    ctx.closePath();
    ctx.fill();

    if (!isHidden) {
      // 绘制地块侧边（增强立体感）
      const rightColor = adjustColorBrightness(baseColor, -15);
      ctx.fillStyle = rightColor;
      ctx.beginPath();
      ctx.moveTo(x + tileWidth / 2, y);
      ctx.lineTo(x, y + tileHeight / 2);
      ctx.lineTo(x, y + tileHeight / 2 + 6);
      ctx.lineTo(x + tileWidth / 2, y + 6);
      ctx.closePath();
      ctx.fill();

      const leftColor = adjustColorBrightness(baseColor, -25);
      ctx.fillStyle = leftColor;
      ctx.beginPath();
      ctx.moveTo(x - tileWidth / 2, y);
      ctx.lineTo(x, y + tileHeight / 2);
      ctx.lineTo(x, y + tileHeight / 2 + 6);
      ctx.lineTo(x - tileWidth / 2, y + 6);
      ctx.closePath();
      ctx.fill();

      // 顶部高光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(x, y - tileHeight / 2);
      ctx.lineTo(x + tileWidth / 3, y - tileHeight / 6);
      ctx.lineTo(x, y);
      ctx.lineTo(x - tileWidth / 3, y - tileHeight / 6);
      ctx.closePath();
      ctx.fill();

      // 绘制地形特征
      renderTerrainFeature(ctx, tile, x, y);
    }

    // 边框
    ctx.strokeStyle = isHidden ? '#0f0f1a' : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 药材标记
    if (tile.medicine && tile.discoveryState === 'explored') {
      renderMedicineMarker(ctx, x, y);
    }

    // 已访问标记
    if (tile.visited) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x, y - tileHeight / 2);
      ctx.lineTo(x + tileWidth / 2, y);
      ctx.lineTo(x, y + tileHeight / 2);
      ctx.lineTo(x - tileWidth / 2, y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const renderTerrainFeature = (ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number) => {
    switch (tile.terrain) {
      case 'forest':
        // 绘制竹林
        ctx.fillStyle = wuxing === WuxingType.Wood ? '#2E7D32' : '#1B5E20';
        ctx.beginPath();
        ctx.arc(x, y - 10, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#388E3C';
        ctx.beginPath();
        ctx.arc(x - 2, y - 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 2, y - 12, 3, 0, Math.PI * 2);
        ctx.fill();
        // 竹节
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x, y - 2);
        ctx.stroke();
        break;

      case 'mountain':
        // 绘制山峰
        ctx.fillStyle = wuxing === WuxingType.Fire ? '#BF360C' : '#757575';
        ctx.beginPath();
        ctx.moveTo(x, y - 18);
        ctx.lineTo(x + 7, y - 4);
        ctx.lineTo(x - 7, y - 4);
        ctx.closePath();
        ctx.fill();
        // 山顶积雪/岩石
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x, y - 18);
        ctx.lineTo(x + 3, y - 10);
        ctx.lineTo(x - 3, y - 10);
        ctx.closePath();
        ctx.fill();
        break;

      case 'water':
        // 绘制水波纹
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x, y - 4, 5, 2, 0, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, y - 2, 3, 1.5, 0, 0, Math.PI);
        ctx.stroke();
        break;

      case 'marsh':
        // 绘制芦苇
        ctx.strokeStyle = '#558B2F';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 2);
        ctx.quadraticCurveTo(x - 4, y - 8, x - 3, y - 10);
        ctx.moveTo(x, y - 2);
        ctx.quadraticCurveTo(x, y - 10, x + 1, y - 12);
        ctx.moveTo(x + 4, y - 2);
        ctx.quadraticCurveTo(x + 4, y - 8, x + 5, y - 10);
        ctx.stroke();
        break;

      case 'cave':
        // 绘制洞穴
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.ellipse(x, y - 5, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#424242';
        ctx.beginPath();
        ctx.ellipse(x, y - 5, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  };

  const renderMedicineMarker = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // 外发光
    const gradient = ctx.createRadialGradient(x, y - 8, 0, x, y - 8, 12);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y - 8, 12, 0, Math.PI * 2);
    ctx.fill();

    // 主标记
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y - 8, 6, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(x - 2, y - 10, 2, 0, Math.PI * 2);
    ctx.fill();

    // 星星闪烁效果
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x, y - 12);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y - 2);
    ctx.moveTo(x - 6, y - 8);
    ctx.lineTo(x - 4, y - 8);
    ctx.moveTo(x + 4, y - 8);
    ctx.lineTo(x + 6, y - 8);
    ctx.stroke();
  };

  const renderPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // 玩家光环
    const gradient = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, 15);
    gradient.addColorStop(0, 'rgba(255, 87, 34, 0.4)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // 玩家主体
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(x, y - 10, 9, 0, Math.PI * 2);
    ctx.fill();

    // 玩家高光
    ctx.fillStyle = '#FFAB91';
    ctx.beginPath();
    ctx.arc(x - 3, y - 13, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderFogEffect = (ctx: CanvasRenderingContext2D) => {
    // 绘制底部雾气
    const fogGradient = ctx.createLinearGradient(0, 500, 0, 600);
    fogGradient.addColorStop(0, 'transparent');
    fogGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 500, 800, 100);
  };

  const canvasRef = useCanvas({
    width: 800,
    height: 600,
    onRender: render,
  });

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = screenToWorld(x, y);

    if (worldPos.x >= 0 && worldPos.x < map.size &&
        worldPos.y >= 0 && worldPos.y < map.size) {
      const tile = map.tiles[worldPos.y][worldPos.x];
      onTileClick(tile);
    }
  };

  return (
    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleClick}
        className="cursor-pointer"
        style={{
          background: theme.background,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
};
