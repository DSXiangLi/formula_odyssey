import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChapterStore } from '../stores/chapterStore';
import type { StageConfig, StageState } from '../types/stage';

// 懒加载各阶段组件
const MentorIntroStage = lazy(() => import('./stages/MentorIntroStage'));
const GatheringStage = lazy(() => import('./GatheringStage'));
const BattleStage = lazy(() => import('./stages/BattleStage'));
const FormulaLearningStage = lazy(() => import('./stages/FormulaLearningStage'));
const ClinicalStage = lazy(() => import('./stages/ClinicalStage'));
const OpenWorldStage = lazy(() => import('./stages/OpenWorldStage'));

const STAGES: StageConfig[] = [
  { id: 'mentor-intro', index: 0, title: '师导入门', component: MentorIntroStage },
  { id: 'gathering', index: 1, title: '山谷采药', component: GatheringStage },
  { id: 'battle', index: 2, title: '药灵守护', component: BattleStage },
  { id: 'formula', index: 3, title: '方剂学习', component: FormulaLearningStage },
  { id: 'clinical', index: 4, title: '临床考核', component: ClinicalStage },
  { id: 'open-world', index: 5, title: '开放世界', component: OpenWorldStage },
];

const StageManager: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chapterStore = useChapterStore();

  // 支持查询参数 ?stage=1 直接进入特定阶段（用于测试）
  const initialStageParam = searchParams.get('stage');
  const initialStageIndex = initialStageParam ? parseInt(initialStageParam, 10) : 0;

  const [stageState, setStageState] = useState<StageState>({
    type: 'loading',
    stageIndex: initialStageIndex
  });

  // 加载章节进度
  useEffect(() => {
    if (!chapterId) {
      navigate('/');
      return;
    }

    // 如果URL中有stage参数，直接使用（用于测试）
    if (initialStageParam) {
      const stageIdx = parseInt(initialStageParam, 10);
      if (stageIdx >= 0 && stageIdx < STAGES.length) {
        setStageState({
          type: 'playing',
          stageIndex: stageIdx,
        });
        return;
      }
    }

    const progress = chapterStore.getProgress(chapterId);
    if (progress) {
      // 恢复断点
      setStageState({
        type: 'playing',
        stageIndex: progress.currentStage,
        progress: progress.stageProgress,
      });
    } else {
      // 新章节，从阶段1开始
      setStageState({
        type: 'playing',
        stageIndex: 0,
      });
      // 初始化章节进度
      chapterStore.initChapterProgress(chapterId);
    }
  }, [chapterId, navigate, chapterStore, initialStageParam]);

  // 阶段完成处理
  const handleStageComplete = (result?: unknown) => {
    const currentStageIndex = stageState.stageIndex;

    // 保存阶段进度
    if (chapterId) {
      chapterStore.updateStageProgress(chapterId, currentStageIndex, result);
    }

    if (currentStageIndex < 5) {
      // 进入下一阶段
      setStageState({
        type: 'playing',
        stageIndex: currentStageIndex + 1,
      });
    } else {
      // 章节完成
      setStageState({ type: 'completed', stageIndex: currentStageIndex });
      if (chapterId) {
        chapterStore.completeChapter(chapterId);
      }
      // 延迟后返回章节选择
      setTimeout(() => navigate('/'), 3000);
    }
  };

  // 中途退出处理
  const handleStageExit = () => {
    // 保存当前进度
    if (chapterId) {
      chapterStore.saveCheckpoint(chapterId, stageState.stageIndex, stageState.progress);
    }
    navigate(`/chapter/${chapterId}`);
  };

  // 任意跳转到指定阶段
  const handleStageClick = (stageIndex: number) => {
    // 保存当前阶段进度（如果正在游戏中）
    if (chapterId && stageState.type === 'playing') {
      chapterStore.saveCheckpoint(chapterId, stageState.stageIndex, stageState.progress);
    }

    // 直接跳转到指定阶段
    setStageState({
      type: 'playing',
      stageIndex: stageIndex,
    });
  };

  if (stageState.type === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-emerald-800">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
          <p className="text-white/80">加载章节...</p>
        </div>
      </div>
    );
  }

  if (stageState.type === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-emerald-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">🎉 章节完成！</h1>
          <p className="text-white/80">正在返回章节选择...</p>
        </motion.div>
      </div>
    );
  }

  // 边界检查：如果 stageIndex 超出范围，显示已完成状态
  if (stageState.stageIndex >= STAGES.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-emerald-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">🎉 本章完成！</h1>
          <p className="text-white/80 mb-8">恭喜完成所有阶段学习</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors"
          >
            返回章节选择
          </button>
        </motion.div>
      </div>
    );
  }

  const CurrentStageComponent = STAGES[stageState.stageIndex].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-800">
      {/* 阶段进度指示器 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white/90 font-medium">
              {STAGES[stageState.stageIndex].title}
            </h2>
            <div className="flex items-center gap-1">
              {STAGES.map((stage, idx) => (
                <button
                  key={stage.id}
                  onClick={() => handleStageClick(idx)}
                  className={`w-2 h-2 rounded-full transition-all hover:scale-150 ${
                    idx === stageState.stageIndex
                      ? 'bg-white ring-2 ring-white/50'
                      : idx < stageState.stageIndex
                        ? 'bg-white/60 hover:bg-white/80'
                        : 'bg-white/20 hover:bg-white/40'
                  }`}
                  title={`${stage.title} (${idx + 1}/6)`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 阶段内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stageState.stageIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="pt-16"
        >
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full" />
            </div>
          }>
            <CurrentStageComponent
              chapterId={chapterId!}
              onComplete={handleStageComplete}
              onExit={handleStageExit}
              initialData={stageState.progress}
            />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StageManager;
