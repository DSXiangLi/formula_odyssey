import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { chapters, getChapterProgress } from '../data/chapters';
import { usePlayerStore } from '../stores/playerStore';
import { WuxingType } from '../types';

// 五行对应的颜色配置
const wuxingColors: Record<WuxingType, { primary: string; light: string; gradient: string }> = {
  [WuxingType.Wood]: {
    primary: '#2E7D32',
    light: '#81C784',
    gradient: 'from-green-500 to-emerald-600',
  },
  [WuxingType.Fire]: {
    primary: '#C62828',
    light: '#EF5350',
    gradient: 'from-red-500 to-orange-600',
  },
  [WuxingType.Earth]: {
    primary: '#F9A825',
    light: '#FFD54F',
    gradient: 'from-yellow-500 to-amber-600',
  },
  [WuxingType.Metal]: {
    primary: '#78909C',
    light: '#B0BEC5',
    gradient: 'from-slate-400 to-gray-500',
  },
  [WuxingType.Water]: {
    primary: '#1565C0',
    light: '#42A5F5',
    gradient: 'from-blue-500 to-cyan-600',
  },
};

// 五行对应的图标
const wuxingIcons: Record<WuxingType, string> = {
  [WuxingType.Wood]: '🌲',
  [WuxingType.Fire]: '🔥',
  [WuxingType.Earth]: '⛰️',
  [WuxingType.Metal]: '⚔️',
  [WuxingType.Water]: '💧',
};

// 五行中文名
const wuxingNames: Record<WuxingType, string> = {
  [WuxingType.Wood]: '木',
  [WuxingType.Fire]: '火',
  [WuxingType.Earth]: '土',
  [WuxingType.Metal]: '金',
  [WuxingType.Water]: '水',
};

export default function ChapterSelect() {
  const navigate = useNavigate();
  const playerStore = usePlayerStore();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [filterWuxing, setFilterWuxing] = useState<WuxingType | null>(null);

  // 从playerStore获取解锁和完成的章节
  const { unlockedChapters, completedChapters, collectedMedicines } = playerStore;

  // 计算章节进度
  const chapterProgress = (chapterId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return { collected: 0, total: 0, percentage: 0 };

    const collected = chapter.medicines.filter(med =>
      collectedMedicines.includes(med)
    ).length;
    const total = chapter.medicines.length;
    return {
      collected,
      total,
      percentage: total > 0 ? Math.round((collected / total) * 100) : 0,
    };
  };

  // 判断是否解锁
  const isChapterUnlocked = (chapterId: string) => {
    return unlockedChapters.includes(chapterId);
  };

  // 判断是否完成
  const isChapterCompleted = (chapterId: string) => {
    return completedChapters.includes(chapterId);
  };

  // 处理章节选择
  const handleSelectChapter = (chapterId: string) => {
    if (!isChapterUnlocked(chapterId)) return;
    setSelectedChapter(chapterId);
    navigate(`/chapter/${chapterId}`);
  };

  // 过滤章节
  const filteredChapters = filterWuxing
    ? chapters.filter(ch => ch.wuxing === filterWuxing)
    : chapters;

  // 统计数据
  const totalProgress = getChapterProgress(completedChapters);
  const unlockedCount = chapters.filter(ch => isChapterUnlocked(ch.id)).length;
  const completedCount = completedChapters.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      {/* 头部导航 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">📜 章节选择</h1>
            <span className="text-sm text-gray-500">
              已解锁 {unlockedCount}/{chapters.length} 章
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* 玩家信息 */}
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1 bg-amber-100 rounded-full">
                💰 {playerStore.currency}
              </span>
              <span className="px-3 py-1 bg-blue-100 rounded-full">
                ⭐ Lv.{playerStore.level}
              </span>
            </div>
            {/* 五行过滤 */}
            <div className="flex gap-1">
              {(Object.values(WuxingType) as WuxingType[]).map((wuxing) => (
                <button
                  key={wuxing}
                  onClick={() => setFilterWuxing(filterWuxing === wuxing ? null : wuxing)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    filterWuxing === wuxing
                      ? 'ring-2 ring-offset-1 scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: wuxingColors[wuxing].light,
                    ringColor: filterWuxing === wuxing ? wuxingColors[wuxing].primary : undefined,
                  }}
                  title={wuxingNames[wuxing]}
                >
                  {wuxingIcons[wuxing]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 进度概览 */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">学习进度</h2>
              <span className="text-2xl font-bold text-amber-600">{totalProgress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>已完成: {completedCount} 章</span>
              <span>已解锁: {unlockedCount} 章</span>
              <span>总章节: {chapters.length} 章</span>
            </div>
          </div>
        </section>

        {/* 章节网格 */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredChapters.map((chapter, index) => {
              const unlocked = isChapterUnlocked(chapter.id);
              const completed = isChapterCompleted(chapter.id);
              const progress = chapterProgress(chapter.id);
              const colors = wuxingColors[chapter.wuxing];

              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectChapter(chapter.id)}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                    unlocked
                      ? 'hover:shadow-xl hover:-translate-y-1'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* 卡片背景 */}
                  <div
                    className={`h-48 bg-gradient-to-br ${colors.gradient} p-4 flex flex-col relative`}
                  >
                    {/* 章节编号 */}
                    <div className="absolute top-3 left-3 text-white/80 font-mono text-sm">
                      第{chapter.chapterNumber}章
                    </div>

                    {/* 状态图标 */}
                    <div className="absolute top-3 right-3">
                      {completed ? (
                        <span className="text-2xl" title="已完成">✅</span>
                      ) : unlocked ? (
                        <span className="text-2xl" title="已解锁">🔓</span>
                      ) : (
                        <span className="text-2xl" title="未解锁">🔒</span>
                      )}
                    </div>

                    {/* 五行图标 */}
                    <div className="mt-8 text-center">
                      <span className="text-4xl">{wuxingIcons[chapter.wuxing]}</span>
                    </div>

                    {/* 章节名称 */}
                    <div className="mt-auto text-center">
                      <h3 className="text-white font-bold text-lg">{chapter.title}</h3>
                      <p className="text-white/70 text-xs mt-1">{chapter.subtitle}</p>
                    </div>

                    {/* 进度条 */}
                    {unlocked && progress.total > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-white/80 text-xs mb-1">
                          <span>收集进度</span>
                          <span>{progress.collected}/{progress.total}</span>
                        </div>
                        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 底部信息 */}
                  <div className="bg-white p-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {chapter.medicines.length}味药 · {chapter.formulas.length}个方剂
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: colors.light + '40',
                          color: colors.primary,
                        }}
                      >
                        {wuxingNames[chapter.wuxing]}
                      </span>
                    </div>
                    {!unlocked && chapter.unlockRequirements.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        需完成: 第{chapter.unlockRequirements.map(req =>
                          chapters.find(c => c.id === req)?.chapterNumber || '?'
                        ).join(', ')}章
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 空状态 */}
        {filteredChapters.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">该五行暂无章节</p>
          </div>
        )}
      </main>

      {/* 底部说明 */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
        <p>药灵山谷 v3.0 - AI原生中医学习游戏</p>
        <p className="mt-1">完成章节解锁新区域和技能</p>
      </footer>
    </div>
  );
}
