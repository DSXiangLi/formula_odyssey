import React from 'react';

interface MentorAvatarProps {
  expression: 'happy' | 'thinking' | 'surprised' | 'concerned' | 'celebrating';
  wuxing: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  size?: 'sm' | 'md' | 'lg';
}

const wuxingColors: Record<string, { primary: string; light: string }> = {
  wood: { primary: '#2E7D32', light: '#81C784' },
  fire: { primary: '#C62828', light: '#EF5350' },
  earth: { primary: '#F9A825', light: '#FFD54F' },
  metal: { primary: '#78909C', light: '#B0BEC5' },
  water: { primary: '#1565C0', light: '#42A5F5' },
};

const expressions: Record<string, string> = {
  happy: '😊',
  thinking: '🤔',
  surprised: '😮',
  concerned: '😟',
  celebrating: '🎉',
};

export const MentorAvatar: React.FC<MentorAvatarProps> = ({
  expression,
  wuxing,
  size = 'md',
}) => {
  const colors = wuxingColors[wuxing];
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-32 h-32 text-5xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg transition-all`}
      style={{
        background: `linear-gradient(135deg, ${colors.light}, ${colors.primary})`,
      }}
    >
      <span>{expressions[expression]}</span>
    </div>
  );
};

export default MentorAvatar;
