import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, CheckCircle } from 'lucide-react';
import { useChapterStore } from '../stores/chapterStore';
import { getChapterById } from '../data/chapters';
import { getMedicineByName } from '../data/medicines';
import { getFormulaByName } from '../data/formulas';
import type { WuxingType } from '../types';

const wuxingColors: Record<WuxingType, { primary: string; light: string; gradient: string }> = {
  wood: { primary: '#2E7D32', light: '#81C784', gradient: 'from-green-600 to-emerald-700' },
  fire: { primary: '#C62828', light: '#EF5350', gradient: 'from-red-600 to-orange-700' },
  earth: { primary: '#F9A825', light: '#FFD54F', gradient: 'from-yellow-600 to-amber-700' },
  metal: { primary: '#78909C', light: '#B0BEC5', gradient: 'from-gray-500 to-gray-700' },
  water: { primary: '#1565C0', light: '#42A5F5', gradient: 'from-blue-600 to-blue-800' },
};

const wuxingNames: Record<WuxingType, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// 区域名称映射
const wuxingRegionNames: Record<WuxingType, string> = {
  wood: '青木林',
  fire: '赤焰峰',
  earth: '黄土丘',
  metal: '白金原',
  water: '黑水潭',
};

const ChapterEntry: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const chapterStore = useChapterStore();

  if (!chapterId) {
    navigate('/');
    return null;
  }

  const chapter = getChapterById(chapterId);
  const progress = chapterStore.getChapterProgress(chapterId);

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">章节不存在</p>
      </div>
    );
  }

  const colors = wuxingColors[chapter.wuxing];
  const status = progress ? 'in_progress' : 'available';
  const currentStage = progress?.currentStage || 0;

  // 获取药材和方剂信息（chapter.medicines 和 chapter.formulas 是名称数组）
  const medicines = chapter.medicines
    .map(getMedicineByName)
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  const formulas = chapter.formulas
    .map(getFormulaByName)
    .filter((f): f is NonNullable<typeof f> => f !== undefined);

  // 处理开始/继续
  const handleStart = () => {
    navigate(`/chapter/${chapterId}/stage`);
  };

  // 处理返回
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回章节选择</span>
          </button>

          {chapter.isCompleted && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span>已完成</span>
            </div>
          )}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 章节标题卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${colors.gradient} rounded-3xl p-8 mb-6 shadow-2xl`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                    第{chapter.chapterNumber}章
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                    {wuxingNames[chapter.wuxing]}行 · {wuxingRegionNames[chapter.wuxing]}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">{chapter.title}</h1>
                <p className="text-white/80 text-lg">{chapter.subtitle}</p>
              </div>

              {/* 五行图标 */}
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
                {chapter.wuxing === 'wood' && '🌲'}
                {chapter.wuxing === 'fire' && '🔥'}
                {chapter.wuxing === 'earth' && '🏔️'}
                {chapter.wuxing === 'metal' && '⚔️'}
                {chapter.wuxing === 'water' && '💧'}
              </div>
            </div>

            {/* 预计时长 */}
            <div className="mt-6 flex items-center gap-6 text-white/70">
              <span>⏱️ 预计用时：45分钟</span>
              <span>📚 6个学习阶段</span>
              {status === 'in_progress' && (
                <span>📍 当前阶段：第{currentStage + 1}阶段</span>
              )}
            </div>
          </motion.div>

          {/* 学习内容概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          >
            {/* 本章药材 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🌿</span> 本章药材（{medicines.length}味）
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white/5 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-lg">
                      🌿
                    </div>
                    <div>
                      <p className="text-white font-medium">{med.name}</p>
                      <p className="text-white/50 text-sm">{med.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 本章方剂 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📜</span> 本章方剂（{formulas.length}个）
              </h3>
              <div className="space-y-3">
                {formulas.map((formula) => (
                  <div
                    key={formula.id}
                    className="bg-white/5 rounded-lg p-3"
                  >
                    <p className="text-white font-medium">{formula.name}</p>
                    <p className="text-white/50 text-sm">{formula.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 学习流程 - 可点击选择阶段 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">📋 学习流程（点击任意阶段直接进入）</h3>
            <div className="flex items-center justify-between">
              {[
                { icon: '👨‍⚕️', name: '师导入门', time: '5min' },
                { icon: '🎮', name: '山谷采药', time: '15min' },
                { icon: '⚔️', name: '药灵守护', time: '5min' },
                { icon: '📚', name: '方剂学习', time: '10min' },
                { icon: '🩺', name: '临床考核', time: '10min' },
                { icon: '🌍', name: '开放世界', time: '5min' },
              ].map((stage, idx) => (
                <div key={stage.name} className="flex items-center">
                  <button
                    onClick={() => navigate(`/chapter/${chapterId}/stage?stage=${idx}`)}
                    className="text-center group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-1 transition-all group-hover:scale-110 ${
                      idx < currentStage
                        ? 'bg-green-500/50 group-hover:bg-green-500/70'
                        : idx === currentStage
                          ? 'bg-blue-500/50 group-hover:bg-blue-500/70'
                          : 'bg-white/10 group-hover:bg-white/20'
                    }`}>
                      {stage.icon}
                    </div>
                    <p className="text-white/60 text-xs group-hover:text-white/90">{stage.name}</p>
                  </button>
                  {idx < 5 && (
                    <div className={`w-4 h-0.5 mx-1 ${
                      idx < currentStage ? 'bg-green-500/50' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-4"
          >
            {!chapter.isUnlocked ? (
              <div className="px-8 py-4 bg-gray-700 rounded-full text-gray-400 flex items-center gap-2">
                <span>🔒</span>
                <span>章节未解锁</span>
              </div>
            ) : chapter.isCompleted ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <RotateCcw size={20} />
                <span>重新学习</span>
              </button>
            ) : status === 'in_progress' ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <RotateCcw size={20} />
                <span>继续学习（可选择任意阶段）</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <Play size={20} />
                <span>开始本章（可选择任意阶段）</span>
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChapterEntry;
