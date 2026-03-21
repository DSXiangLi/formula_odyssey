// 占位图像和SVG组件系统
// 当AI图像生成完成前，使用SVG占位符

import React from 'react';

interface PlaceholderImageProps {
  type: 'mountain' | 'forest' | 'flower' | 'stream' | 'cliff' | 'seed' | 'herb' | 'spirit';
  seedId?: string;
  className?: string;
}

// 区域背景SVG占位符
export const RegionBackground: React.FC<{ region: string; className?: string }> = ({ region, className }) => {
  const gradients: Record<string, string> = {
    mountain: 'from-blue-900/40 via-slate-800/60 to-slate-900',
    forest: 'from-emerald-900/40 via-green-900/60 to-green-950',
    flower: 'from-amber-900/40 via-rose-900/40 to-amber-950',
    stream: 'from-cyan-900/40 via-teal-900/60 to-cyan-950',
    cliff: 'from-stone-900/60 via-amber-950/40 to-stone-950',
  };

  const patterns: Record<string, React.ReactNode> = {
    mountain: (
      <svg viewBox="0 0 1920 1080" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mtn-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8f4f8" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#87ceeb" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* 远山 */}
        <path d="M0,600 L300,300 L600,500 L900,200 L1200,450 L1500,250 L1920,600 L1920,1080 L0,1080 Z" fill="url(#mtn-grad)" opacity="0.5" />
        {/* 雪山 */}
        <path d="M200,1080 L500,400 L800,1080 Z" fill="#f0f8ff" opacity="0.3" />
        <path d="M1000,1080 L1300,350 L1600,1080 Z" fill="#f0f8ff" opacity="0.25" />
        {/* 雪花粒子 */}
        {[...Array(20)].map((_, i) => (
          <circle key={i} cx={Math.random() * 1920} cy={Math.random() * 600} r={Math.random() * 3 + 1} fill="white" opacity={Math.random() * 0.5 + 0.2}>
            <animate attributeName="cy" from="0" to="1080" dur={`${Math.random() * 5 + 5}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),
    forest: (
      <svg viewBox="0 0 1920 1080" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="forest-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1b4d3e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* 树木剪影 */}
        {[...Array(15)].map((_, i) => (
          <g key={i} transform={`translate(${i * 150 + Math.random() * 50}, ${800 + Math.random() * 100})`}>
            <ellipse cx="0" cy="0" rx="40" ry="100" fill="#0d3328" opacity="0.7" />
            <ellipse cx="0" cy="-80" rx="60" ry="80" fill="#1b4d3e" opacity="0.5" />
          </g>
        ))}
        {/* 光斑 */}
        {[...Array(10)].map((_, i) => (
          <circle key={i} cx={Math.random() * 1920} cy={Math.random() * 800} r={Math.random() * 100 + 50} fill="#c9a961" opacity={0.1}>
            <animate attributeName="opacity" values="0.05;0.15;0.05" dur={`${Math.random() * 3 + 2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),
    flower: (
      <svg viewBox="0 0 1920 1080" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="flower-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4a574" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* 花海 */}
        {[...Array(50)].map((_, i) => (
          <g key={i} transform={`translate(${Math.random() * 1920}, ${600 + Math.random() * 400})`}>
            <circle r={Math.random() * 10 + 5} fill={['#ffb6c1', '#ffd700', '#ffa07a'][Math.floor(Math.random() * 3)]} opacity={0.4} />
          </g>
        ))}
        {/* 飘落的花瓣 */}
        {[...Array(15)].map((_, i) => (
          <ellipse key={i} cx={Math.random() * 1920} cy={Math.random() * 800} rx={5} ry={8} fill="#ffb6c1" opacity={0.5}>
            <animate attributeName="cy" from="0" to="1080" dur={`${Math.random() * 8 + 5}s`} repeatCount="indefinite" />
            <animate attributeName="cx" values={`${Math.random() * 1920};${Math.random() * 1920}`} dur={`${Math.random() * 10 + 10}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
      </svg>
    ),
    stream: (
      <svg viewBox="0 0 1920 1080" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="stream-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a7c8b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* 溪流 */}
        <path d="M0,800 Q400,750 800,800 T1600,780 L1920,800 L1920,1080 L0,1080 Z" fill="#4a7c8b" opacity="0.3" />
        {/* 水面闪光 */}
        {[...Array(20)].map((_, i) => (
          <ellipse key={i} cx={Math.random() * 1920} cy={780 + Math.random() * 200} rx={20} ry={5} fill="white" opacity={0.3}>
            <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${Math.random() * 2 + 1}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
        {/* 雾气 */}
        {[...Array(8)].map((_, i) => (
          <ellipse key={i} cx={Math.random() * 1920} cy={700 + Math.random() * 100} rx={100} ry={30} fill="white" opacity={0.1}>
            <animate attributeName="cx" values={`${Math.random() * 1920};${Math.random() * 1920}`} dur={`${Math.random() * 20 + 20}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
      </svg>
    ),
    cliff: (
      <svg viewBox="0 0 1920 1080" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="cliff-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5c4033" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* 岩壁 */}
        <path d="M0,1080 L0,400 L200,350 L400,450 L600,300 L800,400 L1000,280 L1200,380 L1400,320 L1600,420 L1920,350 L1920,1080 Z" fill="#3d2f26" opacity="0.7" />
        {/* 矿石发光 */}
        {[...Array(10)].map((_, i) => (
          <circle key={i} cx={Math.random() * 1600 + 200} cy={400 + Math.random() * 300} r={Math.random() * 3 + 2} fill="#c9a961" opacity={0.6}>
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${Math.random() * 3 + 2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),
  };

  return (
    <div className={`w-full h-full ${gradients[region] || gradients.mountain}`}>
      {patterns[region] || patterns.mountain}
    </div>
  );
};

// 种子SVG占位符
export const SeedPlaceholder: React.FC<{ collected?: boolean; className?: string }> = ({ collected, className }) => {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <radialGradient id="crystal-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={collected ? '#e8d4a2' : '#ffffff'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={collected ? '#c9a961' : '#cccccc'} stopOpacity="0.4" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* 水晶球 */}
      <circle cx="50" cy="50" r="35" fill="url(#crystal-grad)" opacity="0.6" />
      <circle cx="50" cy="50" r="30" fill="none" stroke={collected ? '#c9a961' : '#ffffff'} strokeWidth="2" opacity="0.8" filter="url(#glow)" />
      {/* 内部草药 */}
      {collected ? (
        <text x="50" y="55" textAnchor="middle" fontSize="20">🌿</text>
      ) : (
        <ellipse cx="50" cy="50" rx="15" ry="8" fill="#c9a961" opacity="0.3" />
      )}
      {/* 光点 */}
      <circle cx="35" cy="35" r="3" fill="white" opacity="0.6" />
    </svg>
  );
};

// 药灵形象SVG占位符
export const SpiritPlaceholder: React.FC<{ medicineId: string; className?: string }> = ({ medicineId, className }) => {
  // 根据药ID返回不同的颜色
  const colors: Record<string, string> = {
    mahuang: '#ff6b6b',
    renshen: '#ffd93d',
    lingzhi: '#a78bfa',
    jinyinhua: '#fbbf24',
    guizhi: '#f472b6',
  };

  const color = colors[medicineId] || '#c9a961';

  return (
    <svg viewBox="0 0 200 200" className={className}>
      <defs>
        <radialGradient id={`spirit-grad-${medicineId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      {/* 光环 */}
      <circle cx="100" cy="100" r="80" fill={`url(#spirit-grad-${medicineId})`} opacity="0.3" />
      {/* 人物占位 */}
      <circle cx="100" cy="80" r="30" fill={color} opacity="0.5" />
      <path d="M70,120 Q100,160 130,120 L130,180 L70,180 Z" fill={color} opacity="0.5" />
      {/* 装饰 */}
      <circle cx="100" cy="60" r="8" fill="#c9a961" opacity="0.8" />
    </svg>
  );
};

// 图像加载组件
interface GameImageProps {
  src?: string;
  placeholderType: 'region' | 'seed' | 'spirit';
  placeholderData?: string;
  alt: string;
  className?: string;
}

export const GameImage: React.FC<GameImageProps> = ({ src, placeholderType, placeholderData, alt, className }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  if (!src || error) {
    // 显示占位符
    if (placeholderType === 'region') {
      return <RegionBackground region={placeholderData || 'mountain'} className={className} />;
    }
    if (placeholderType === 'seed') {
      return <SeedPlaceholder collected={placeholderData === 'collected'} className={className} />;
    }
    if (placeholderType === 'spirit') {
      return <SpiritPlaceholder medicineId={placeholderData || 'mahuang'} className={className} />;
    }
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-tertiary/50">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};
