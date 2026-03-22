import React from 'react';
import { motion } from 'framer-motion';
import type { WuxingType } from '../../types';
import {
  Trophy,
  XCircle,
  CheckCircle,
  RotateCcw,
  ArrowRight,
  Gem,
  Sparkles,
  Star,
  Target,
  Scroll,
  Zap,
} from 'lucide-react';

// 奖励类型
export interface Reward {
  diamonds: number;
  skillId?: string;
  skillName?: string;
  chapterUnlock?: string;
}

interface BossResultProps {
  success: boolean;
  correctAnswers: {
    treatment: string;
    formula: string;
    junMedicine: string;
  };
  playerAnswers: {
    treatment: string;
    formula: string;
    junMedicine: string;
  };
  rewards: Reward;
  explanation: string;
  chapterWuxing: WuxingType;
  onNextChapter: () => void;
  onRetry: () => void;
}

// 五行色彩配置
const WUXING_COLORS: Record<WuxingType, { primary: string; light: string; gradient: string; shadow: string }> = {
  wood: {
    primary: '#2E7D32',
    light: '#81C784',
    gradient: 'from-green-600 to-emerald-400',
    shadow: 'shadow-green-500/30',
  },
  fire: {
    primary: '#C62828',
    light: '#EF5350',
    gradient: 'from-red-600 to-orange-400',
    shadow: 'shadow-red-500/30',
  },
  earth: {
    primary: '#F9A825',
    light: '#FFD54F',
    gradient: 'from-yellow-600 to-amber-400',
    shadow: 'shadow-yellow-500/30',
  },
  metal: {
    primary: '#78909C',
    light: '#B0BEC5',
    gradient: 'from-slate-500 to-slate-300',
    shadow: 'shadow-slate-500/30',
  },
  water: {
    primary: '#1565C0',
    light: '#42A5F5',
    gradient: 'from-blue-700 to-cyan-400',
    shadow: 'shadow-blue-500/30',
  },
};

export const BossResult: React.FC<BossResultProps> = ({
  success,
  correctAnswers,
  playerAnswers,
  rewards,
  explanation,
  chapterWuxing,
  onNextChapter,
  onRetry,
}) => {
  const colors = WUXING_COLORS[chapterWuxing];

  // 验证每一步
  const treatmentCorrect = playerAnswers.treatment === correctAnswers.treatment;
  const formulaCorrect = playerAnswers.formula === correctAnswers.formula;
  const junCorrect = playerAnswers.junMedicine === correctAnswers.junMedicine ||
    correctAnswers.junMedicine.includes(playerAnswers.junMedicine) ||
    playerAnswers.junMedicine.includes(correctAnswers.junMedicine);

  const steps = [
    { name: '治法', correct: treatmentCorrect, player: playerAnswers.treatment, answer: correctAnswers.treatment },
    { name: '方剂', correct: formulaCorrect, player: playerAnswers.formula, answer: correctAnswers.formula },
    { name: '君药', correct: junCorrect, player: playerAnswers.junMedicine, answer: correctAnswers.junMedicine },
  ];

  const correctCount = steps.filter(s => s.correct).length;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 shadow-2xl ${colors.shadow} ${
          success ? 'bg-slate-900' : 'bg-slate-900'
        }`}
        style={{ borderColor: success ? colors.primary : '#EF4444' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* 结果头部 */}
        <div
          className={`relative p-8 text-center ${
            success
              ? `bg-gradient-to-br ${colors.gradient}`
              : 'bg-gradient-to-br from-slate-700 to-slate-800'
          }`}
        >
          {/* 装饰性粒子 */}
          {success && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: colors.light,
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
                    delay: Math.random() * 2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            className="relative z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            {success ? (
              <Trophy className="w-20 h-20 text-white mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            )}
          </motion.div>

          <motion.h1
            className={`text-4xl font-bold mb-2 ${success ? 'text-white' : 'text-slate-200'}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {success ? '挑战成功！' : '挑战失败'}
          </motion.h1>

          <motion.p
            className={`text-lg ${success ? 'text-white/90' : 'text-slate-400'}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {success
              ? `太棒了！你正确回答了 ${correctCount}/3 步诊断`
              : `你答对了 ${correctCount}/3 步，还需要继续努力`}
          </motion.p>

          {/* 进度环 */}
          <motion.div
            className="mt-6 flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={success ? 'rgba(255,255,255,0.2)' : 'rgba(100,100,100,0.3)'}
                  strokeWidth="12"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={success ? 'white' : '#EF4444'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(correctCount / 3) * 351.86} 351.86`}
                  initial={{ strokeDasharray: '0 351.86' }}
                  animate={{ strokeDasharray: `${(correctCount / 3) * 351.86} 351.86` }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${success ? 'text-white' : 'text-slate-300'}`}>
                  {correctCount}/3
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-6">
          {/* 答案对比 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-400" />
              答案对比
            </h3>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={step.name}
                  className={`p-3 rounded-lg border ${
                    step.correct
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">{step.name}</span>
                      {step.correct ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${step.correct ? 'text-green-400' : 'text-red-400'}`}>
                      {step.correct ? '正确' : '错误'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">你的答案：</span>
                      <span className={step.correct ? 'text-green-300' : 'text-red-300'}>
                        {step.player}
                      </span>
                    </div>
                    {!step.correct && (
                      <div>
                        <span className="text-slate-500">正确答案：</span>
                        <span className="text-green-300">{step.answer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 解析 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Scroll className="w-5 h-5 text-slate-400" />
              辨证解析
            </h3>
            <p className="text-slate-300 leading-relaxed">{explanation}</p>
          </div>

          {/* 奖励展示 */}
          {success && (
            <motion.div
              className={`p-6 rounded-xl bg-gradient-to-br ${colors.gradient}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                通关奖励
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                    <Gem className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">方灵石</p>
                    <p className="text-white font-bold text-xl">+{rewards.diamonds}</p>
                  </div>
                </div>
                {rewards.skillName && (
                  <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">新技能</p>
                      <p className="text-white font-bold">{rewards.skillName}</p>
                    </div>
                  </div>
                )}
              </div>
              {rewards.chapterUnlock && (
                <div className="mt-4 p-3 bg-white/20 rounded-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-white" />
                  <span className="text-white">下一章已解锁！</span>
                </div>
              )}
            </motion.div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            {!success && (
              <button
                onClick={onRetry}
                className="flex-1 py-4 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                重新挑战
              </button>
            )}
            <button
              onClick={onNextChapter}
              className={`flex-1 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                success
                  ? `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90`
                  : 'bg-slate-600 text-white hover:bg-slate-500'
              }`}
            >
              {success ? (
                <>
                  进入下一章
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                '返回章节'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BossResult;
