import { motion } from 'framer-motion';
import type { GeneratedEvent } from '../../types/openWorld';
import { getEventTypeConfig } from '../../services/openWorldService';

interface EventCompleteProps {
  event: GeneratedEvent;
  onContinue: () => void;
  onReturn: () => void;
}

export default function EventComplete({
  event,
  onContinue,
  onReturn,
}: EventCompleteProps) {
  const config = getEventTypeConfig(event.type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          border: `2px solid ${config.color}60`,
        }}
      >
        {/* 成功动画头部 */}
        <div
          className="relative p-8 text-center"
          style={{ backgroundColor: `${config.color}30` }}
        >
          {/* 粒子效果 */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: config.color,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-amber-100 mb-2"
          >
            任务完成！
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-amber-200/70"
          >
            你成功完成了「{event.title}」
          </motion.p>
        </div>

        {/* 奖励详情 */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-amber-200/60 uppercase tracking-wider text-center">
            获得奖励
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* 方灵石 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/30 text-center"
            >
              <div className="text-3xl mb-2">💎</div>
              <div className="text-2xl font-bold text-amber-400">
                +{event.rewards.diamonds}
              </div>
              <div className="text-xs text-amber-200/60">方灵石</div>
            </motion.div>

            {/* 技能点 */}
            {event.rewards.skillPoints && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/30 text-center"
              >
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-purple-400">
                  +{event.rewards.skillPoints}
                </div>
                <div className="text-xs text-purple-200/60">技能点</div>
              </motion.div>
            )}

            {/* 称号 */}
            {event.rewards.title && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="col-span-2 p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-center"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-xl font-bold text-yellow-400">
                  {event.rewards.title}
                </div>
                <div className="text-xs text-yellow-200/60">获得称号</div>
              </motion.div>
            )}

            {/* 新技能 */}
            {event.rewards.newSkill && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="col-span-2 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center"
              >
                <div className="text-3xl mb-2">✨</div>
                <div className="text-lg font-bold text-emerald-400">
                  习得新技能：{event.rewards.newSkill}
                </div>
              </motion.div>
            )}

            {/* 亲密度 */}
            {event.rewards.affinityBonus && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="p-4 rounded-xl bg-pink-500/20 border border-pink-500/30 text-center"
              >
                <div className="text-3xl mb-2">❤️</div>
                <div className="text-2xl font-bold text-pink-400">
                  +{event.rewards.affinityBonus}
                </div>
                <div className="text-xs text-pink-200/60">亲密度</div>
              </motion.div>
            )}
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 mt-6">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="flex-1 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 transition-all"
            >
              继续探索
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReturn}
              className="flex-1 py-3 rounded-xl font-bold text-lg bg-slate-700 hover:bg-slate-600 text-amber-100 transition-all"
            >
              返回地图
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
