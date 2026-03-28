import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MedicineSpirit } from '../../systems/battle/types';

interface SpiritCharacterProps {
  spirit: MedicineSpirit;
  onClick: () => void;
  isActive: boolean;
}

const SpiritCharacter: React.FC<SpiritCharacterProps> = ({
  spirit,
  onClick,
  isActive,
}) => {
  const [imageError, setImageError] = useState(false);

  // 根据性格设置不同的漂浮参数
  const getFloatConfig = () => {
    switch (spirit.personality) {
      case 'gentle':
        return { y: [0, -10, 0], duration: 4, delay: 0 };
      case 'lively':
        return { y: [0, -20, 0], duration: 2.5, delay: spirit.floatPhase * 0.5 };
      case 'dignified':
        return { y: [0, -8, 0], duration: 5, delay: spirit.floatPhase * 0.3 };
      default:
        return { y: [0, -15, 0], duration: 3, delay: spirit.floatPhase };
    }
  };

  const floatConfig = getFloatConfig();

  // 根据难度设置颜色主题
  const getDifficultyColor = () => {
    switch (spirit.difficulty) {
      case 'elite':
        return 'border-purple-400';
      case 'boss':
        return 'border-orange-400';
      default:
        return 'border-blue-400';
    }
  };

  // 驯服状态下的绿色主题
  const getBorderColor = () => {
    if (spirit.state === 'tamed') {
      return 'border-green-400';
    }
    if (isActive) {
      return getDifficultyColor();
    }
    return 'border-white/20';
  };

  // 根据状态获取背景发光效果
  const getGlowEffect = () => {
    if (spirit.state === 'tamed') {
      return 'shadow-[0_0_20px_rgba(74,222,128,0.5)]';
    }
    if (isActive) {
      return 'shadow-[0_0_30px_rgba(96,165,250,0.6)]';
    }
    return 'shadow-lg';
  };

  return (
    <motion.div
      data-testid={`spirit-character-${spirit.id}`}
      className="relative flex flex-col items-center cursor-pointer"
      onClick={onClick}
      animate={{
        y: floatConfig.y,
        scale: isActive ? 1.1 : 1,
        opacity: spirit.state === 'escaped' ? 0.3 : 1,
      }}
      transition={{
        y: {
          duration: floatConfig.duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: floatConfig.delay,
        },
        scale: { duration: 0.2 },
        opacity: { duration: 0.3 },
      }}
      whileHover={{ scale: isActive ? 1.1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 连接线 - 仅在激活状态时显示 */}
      {isActive && spirit.state !== 'tamed' && (
        <motion.div
          data-testid="spirit-connection-line"
          className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-gradient-to-r from-blue-400 to-transparent origin-left"
          style={{
            transform: `rotate(${Math.atan2(100 - spirit.position.y, 200 - spirit.position.x)}rad)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* 药灵容器 */}
      <div
        data-testid="spirit-container"
        className={`relative w-24 h-24 rounded-full overflow-hidden ${getBorderColor()} ${getGlowEffect()} transition-all duration-300 ${
          isActive ? 'border-4' : 'border-2'
        } ${spirit.state === 'escaped' ? 'grayscale' : ''}`}
      >
        {/* 图片或降级显示 */}
        {imageError ? (
          <div
            data-testid="spirit-fallback"
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-3xl font-bold"
          >
            {spirit.name.charAt(0)}
          </div>
        ) : (
          <img
            data-testid="spirit-image"
            src={spirit.imageUrl}
            alt={spirit.displayName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* 呼吸发光效果 */}
        <motion.div
          data-testid="spirit-glow"
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              'inset 0 0 20px rgba(255,255,255,0.1)',
              'inset 0 0 40px rgba(255,255,255,0.3)',
              'inset 0 0 20px rgba(255,255,255,0.1)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 驯服状态覆盖层 */}
        {spirit.state === 'tamed' && (
          <motion.div
            data-testid="spirit-tamed-overlay"
            className="absolute inset-0 bg-green-500/30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="text-4xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              ✓
            </motion.span>
          </motion.div>
        )}

        {/* 激活状态光环 */}
        {isActive && spirit.state !== 'tamed' && (
          <motion.div
            data-testid="spirit-active-ring"
            className="absolute -inset-2 rounded-full border-2 border-blue-400/50"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* 药灵名称 */}
      <motion.div
        data-testid="spirit-name"
        className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
          isActive
            ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
            : 'bg-black/30 text-white/80 border border-white/10'
        }`}
        animate={{
          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        }}
      >
        {spirit.displayName}
      </motion.div>

      {/* 驯服进度条 */}
      {spirit.state !== 'tamed' && spirit.state !== 'escaped' && (
        <div className="mt-2 w-20">
          <div
            data-testid="spirit-progress-container"
            className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden"
          >
            <motion.div
              data-testid="spirit-progress-bar"
              className={`h-full rounded-full ${
                spirit.tameProgress >= 100
                  ? 'bg-green-400'
                  : spirit.tameProgress >= 50
                  ? 'bg-yellow-400'
                  : 'bg-blue-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${spirit.tameProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p
            data-testid="spirit-progress-text"
            className="text-xs text-center text-white/60 mt-0.5"
          >
            {spirit.tameProgress}%
          </p>
        </div>
      )}

      {/* 驯服完成标签 */}
      {spirit.state === 'tamed' && (
        <motion.div
          data-testid="spirit-tamed-label"
          className="mt-1 px-2 py-0.5 bg-green-500/30 text-green-300 text-xs rounded-full border border-green-400/50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          已驯服
        </motion.div>
      )}

      {/* 逃跑标签 */}
      {spirit.state === 'escaped' && (
        <div
          data-testid="spirit-escaped-label"
          className="mt-1 px-2 py-0.5 bg-gray-500/30 text-gray-400 text-xs rounded-full border border-gray-400/50"
        >
          已逃跑
        </div>
      )}
    </motion.div>
  );
};

export default SpiritCharacter;
