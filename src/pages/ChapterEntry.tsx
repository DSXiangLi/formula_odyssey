import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { chapters } from '../data/chapters';
import ValleyScene from '../components/scene/ValleyScene';
import { WuxingType } from '../types';

const wuxingColors: Record<WuxingType, { primary: string; light: string; gradient: string }> = {
  wood: { primary: '#2E7D32', light: '#81C784', gradient: 'from-green-800 to-green-600' },
  fire: { primary: '#C62828', light: '#EF5350', gradient: 'from-red-800 to-red-600' },
  earth: { primary: '#F9A825', light: '#FFD54F', gradient: 'from-amber-700 to-amber-500' },
  metal: { primary: '#78909C', light: '#B0BEC5', gradient: 'from-slate-600 to-slate-400' },
  water: { primary: '#1565C0', light: '#42A5F5', gradient: 'from-blue-800 to-blue-600' },
};

const wuxingIcons: Record<WuxingType, string> = {
  wood: '🌳',
  fire: '🔥',
  earth: '🏔️',
  metal: '⛰️',
  water: '💧',
};

const wuxingNames: Record<WuxingType, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

const ChapterEntry: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { player, setCurrentRegion, currentRegion } = useGameStore();
  const [activeTab, setActiveTab] = useState<'scene' | 'medicines' | 'formulas'>('scene');
  const [isLoading, setIsLoading] = useState(true);

  const chapter = chapters.find(c => c.id === chapterId);

  useEffect(() => {
    if (chapter) {
      setCurrentRegion(chapter.wuxing);
      // 模拟加载延迟确保场景正确渲染
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [chapter, setCurrentRegion]);

  if (!chapter) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">章节未找到</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回章节选择
          </button>
        </div>
      </div>
    );
  }

  const colors = wuxingColors[chapter.wuxing];
  const isLocked = !player.unlockedChapters.includes(chapter.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* 顶部导航 */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-xl">←</span>
            <span>返回章节选择</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{wuxingIcons[chapter.wuxing]}</span>
              <h1 className="text-xl font-bold">{chapter.title}</h1>
            </div>
            <div
              className="px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.light})` }}
            >
              第{chapter.chapterNumber}章
            </div>
          </div>
          <div className="flex items-center gap-2 text-amber-600">
            <span>💎</span>
            <span className="font-mono">{player.currency}</span>
          </div>
        </div>
      </motion.header>

      {/* 标签导航 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-2">
          {[
            { key: 'scene', label: '山谷场景', icon: '🌄' },
            { key: 'medicines', label: '本章药材', icon: '🌿' },
            { key: 'formulas', label: '本章方剂', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-white shadow-md text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {activeTab === 'scene' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {isLocked ? (
              <div className="h-[500px] flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <span className="text-6xl mb-4">🔒</span>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">章节已锁定</h3>
                  <p className="text-gray-500">完成前置章节以解锁</p>
                </div>
              </div>
            ) : (
              <div className="h-[600px] relative">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center bg-gradient-to-b from-green-100 to-green-200">
                    <div className="text-center">
                      <div className="animate-spin text-4xl mb-4">🌳</div>
                      <p className="text-gray-600">正在进入{wuxingNames[chapter.wuxing]}行山谷...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ValleyScene />
                    {/* 探索提示 */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <h4 className="font-bold text-gray-800 mb-2">💡 探索提示</h4>
                      <p className="text-sm text-gray-600">
                        点击种子进行诊断和收集。使用上方五行导航切换不同区域。
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'medicines' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {chapter.medicines.map((medicineId, index) => (
              <motion.div
                key={medicineId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: `linear-gradient(135deg, ${colors.light}40, ${colors.primary}20)` }}
                >
                  🌿
                </div>
                <h4 className="text-center font-medium text-gray-800">{medicineId}</h4>
                <p className="text-center text-xs text-gray-500 mt-1">待收集</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'formulas' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {chapter.formulas.map((formulaId, index) => (
              <motion.div
                key={formulaId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                    📜
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{formulaId}</h4>
                    <p className="text-sm text-gray-500">本章待学习方剂</p>
                  </div>
                  <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                    开始学习
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ChapterEntry;
