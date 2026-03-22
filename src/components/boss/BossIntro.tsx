import React from 'react';
import { motion } from 'framer-motion';
import type { WuxingType } from '../../types';
import {
  Crown,
  Scroll,
  Sword,
  AlertTriangle,
  ChevronRight,
  Flame,
  Shield,
  Target,
} from 'lucide-react';

interface BossIntroProps {
  chapterName: string;
  chapterWuxing: WuxingType;
  caseInfo: string;
  onStart: () => void;
  onExit: () => void;
}

// 五行配置
const WUXING_CONFIG: Record<WuxingType, {
  name: string;
  primary: string;
  light: string;
  gradient: string;
  icon: React.ReactNode;
  description: string;
}> = {
  wood: {
    name: '木',
    primary: '#2E7D32',
    light: '#81C784',
    gradient: 'from-green-600 to-emerald-400',
    icon: <Flame className="w-6 h-6" />,
    description: '春季生发，青木林深处隐藏着强大的挑战',
  },
  fire: {
    name: '火',
    primary: '#C62828',
    light: '#EF5350',
    gradient: 'from-red-600 to-orange-400',
    icon: <Flame className="w-6 h-6" />,
    description: '心主神明，赤焰峰上火焰熊熊',
  },
  earth: {
    name: '土',
    primary: '#F9A825',
    light: '#FFD54F',
    gradient: 'from-yellow-600 to-amber-400',
    icon: <Shield className="w-6 h-6" />,
    description: '脾主运化，黄土丘厚重沉稳',
  },
  metal: {
    name: '金',
    primary: '#78909C',
    light: '#B0BEC5',
    gradient: 'from-slate-500 to-slate-300',
    icon: <Sword className="w-6 h-6" />,
    description: '肺主肃降，白金原锋锐肃杀',
  },
  water: {
    name: '水',
    primary: '#1565C0',
    light: '#42A5F5',
    gradient: 'from-blue-700 to-cyan-400',
    icon: <Target className="w-6 h-6" />,
    description: '肾藏精，黑水潭深不可测',
  },
};

export const BossIntro: React.FC<BossIntroProps> = ({
  chapterName,
  chapterWuxing,
  caseInfo,
  onStart,
  onExit,
}) => {
  const config = WUXING_CONFIG[chapterWuxing];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-xl bg-slate-900 rounded-3xl border-2 shadow-2xl overflow-hidden"
        style={{ borderColor: config.primary }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* 顶部装饰 */}
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${config.gradient}`} />

        {/* 内容区 */}
        <div className="p-8 text-center">
          {/* Boss图标 */}
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <div
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
              style={{ boxShadow: `0 0 40px ${config.primary}40` }}
            >
              <Crown className="w-12 h-12 text-white" />
            </div>
            {/* 光环 */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div
                className="w-32 h-32 rounded-full border-2 border-dashed"
                style={{ borderColor: `${config.primary}30` }}
              />
            </motion.div>
          </motion.div>

          {/* 标题 */}
          <motion.h1
            className="text-3xl font-bold text-white mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Boss挑战
          </motion.h1>

          <motion.p
            className="text-xl mb-6"
            style={{ color: config.light }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {chapterName}
          </motion.p>

          {/* 五行标识 */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span
              className="px-4 py-1 rounded-full text-white font-medium text-sm"
              style={{ backgroundColor: config.primary }}
            >
              {config.name}行
            </span>
            <span className="text-slate-400 text-sm">{config.description}</span>
          </motion.div>

          {/* 挑战说明 */}
          <motion.div
            className="bg-slate-800 rounded-xl p-6 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Scroll className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold text-white">挑战内容</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.primary}30` }}
                >
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">辨证论治</p>
                  <p className="text-slate-400 text-sm">根据病案信息选择正确的治法</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.primary}30` }}
                >
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">选方用药</p>
                  <p className="text-slate-400 text-sm">从本章方剂中选择最适合的方剂</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.primary}30` }}
                >
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">确定君药</p>
                  <p className="text-slate-400 text-sm">指出所选方剂的君药</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 警告提示 */}
          <motion.div
            className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-yellow-400 text-sm">
              三步诊断必须全部正确才能通关，通关后解锁下一章
            </p>
          </motion.div>

          {/* 按钮 */}
          <motion.div
            className="flex gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={onExit}
              className="flex-1 py-3 px-6 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
            >
              返回准备
            </button>
            <button
              onClick={onStart}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 bg-gradient-to-r ${config.gradient}`}
            >
              <Sword className="w-5 h-5" />
              开始挑战
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* 底部装饰 */}
        <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
      </motion.div>
    </motion.div>
  );
};

export default BossIntro;
