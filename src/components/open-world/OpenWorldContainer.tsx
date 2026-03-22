import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenWorldMap, DailyEventList, EventModal, RegionView, EventComplete } from './index';
import type { GeneratedEvent, OpenWorldState } from '../../types/openWorld';
import { generateDailyEvents, checkOpenWorldUnlock } from '../../services/openWorldService';

interface OpenWorldContainerProps {
  completedChapters: string[];
  collectedMedicines: string[];
  onEventComplete: (eventId: string, rewards: { diamonds: number; skillPoints?: number }) => void;
}

export default function OpenWorldContainer({
  completedChapters,
  collectedMedicines,
  onEventComplete,
}: OpenWorldContainerProps) {
  // 状态
  const [view, setView] = useState<'map' | 'region' | 'list'>('map');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<GeneratedEvent | null>(null);
  const [completedEvent, setCompletedEvent] = useState<GeneratedEvent | null>(null);
  const [showEventComplete, setShowEventComplete] = useState(false);

  // 开放世界状态
  const [openWorldState, setOpenWorldState] = useState<OpenWorldState>({
    unlocked: false,
    unlockedRegions: [],
    dailyEvents: [],
    completedEvents: [],
    acceptedEvents: [],
    lastEventDate: '',
    runHistory: [],
  });

  // 检查解锁状态并生成每日事件
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    // 检查是否解锁
    const unlocked = checkOpenWorldUnlock(completedChapters);

    // 获取已解锁区域（前5章对应的区域）
    const unlockedRegions = completedChapters
      .filter(ch => parseInt(ch.replace('chapter_', '')) <= 5)
      .map(ch => {
        const chapterNum = parseInt(ch.replace('chapter_', ''));
        const regionMap: Record<number, string> = {
          1: 'qingmu_lin',
          2: 'chiyan_feng',
          3: 'huangtu_qiu',
          4: 'baijin_yuan',
          5: 'heishui_tan',
        };
        return regionMap[chapterNum];
      })
      .filter(Boolean) as string[];

    setOpenWorldState(prev => {
      // 如果日期改变，生成新事件
      let dailyEvents = prev.dailyEvents;
      if (prev.lastEventDate !== today && unlockedRegions.length > 0) {
        dailyEvents = generateDailyEvents(unlockedRegions, collectedMedicines, today);
      }

      return {
        ...prev,
        unlocked,
        unlockedRegions,
        dailyEvents,
        lastEventDate: today,
      };
    });
  }, [completedChapters, collectedMedicines]);

  // 处理进入区域
  const handleEnterRegion = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    setView('region');
  }, []);

  // 处理返回地图
  const handleBackToMap = useCallback(() => {
    setSelectedRegion(null);
    setView('map');
  }, []);

  // 处理接受事件
  const handleAcceptEvent = useCallback((eventId: string) => {
    setOpenWorldState(prev => ({
      ...prev,
      dailyEvents: prev.dailyEvents.map(e =>
        e.id === eventId ? { ...e, accepted: true } : e
      ),
      acceptedEvents: [...prev.acceptedEvents, eventId],
    }));
  }, []);

  // 处理开始事件
  const handleStartEvent = useCallback((event: GeneratedEvent) => {
    setSelectedEvent(event);
  }, []);

  // 处理完成事件
  const handleCompleteEvent = useCallback((eventId: string, result: { success: boolean }) => {
    const event = openWorldState.dailyEvents.find(e => e.id === eventId);
    if (!event) return;

    if (result.success) {
      // 更新状态
      setOpenWorldState(prev => ({
        ...prev,
        dailyEvents: prev.dailyEvents.map(e =>
          e.id === eventId ? { ...e, completed: true } : e
        ),
        completedEvents: [...prev.completedEvents, eventId],
        acceptedEvents: prev.acceptedEvents.filter(id => id !== eventId),
      }));

      // 触发奖励
      onEventComplete(eventId, {
        diamonds: event.rewards.diamonds,
        skillPoints: event.rewards.skillPoints,
      });

      // 显示完成界面
      setCompletedEvent(event);
      setShowEventComplete(true);
    }

    setSelectedEvent(null);
  }, [openWorldState.dailyEvents, onEventComplete]);

  // 处理关闭完成界面
  const handleCloseComplete = useCallback(() => {
    setShowEventComplete(false);
    setCompletedEvent(null);
  }, []);

  // 获取当前区域的事件
  const getRegionEvents = useCallback(() => {
    if (!selectedRegion) return [];
    return openWorldState.dailyEvents.filter(e => e.regionId === selectedRegion);
  }, [selectedRegion, openWorldState.dailyEvents]);

  // 未解锁提示
  if (!openWorldState.unlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-center p-8"
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-amber-100 mb-2">开放世界未解锁</h2>
          <p className="text-amber-200/70 mb-4">
            完成第5章「化湿剂山谷」后，开放世界将自动解锁。
            继续你的章节冒险吧！
          </p>
          <div className="text-sm text-amber-200/50">
            当前进度: {completedChapters.length}/5 章
          </div>
          <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (completedChapters.length / 5) * 100)}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {view === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {/* 视图切换按钮 */}
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-600 text-amber-100 transition-colors flex items-center gap-2"
              >
                <span>📋</span>
                <span>事件列表</span>
              </button>
            </div>

            <OpenWorldMap
              unlockedRegions={openWorldState.unlockedRegions}
              dailyEvents={openWorldState.dailyEvents}
              completedEvents={openWorldState.completedEvents}
              onEnterRegion={handleEnterRegion}
              onAcceptEvent={handleAcceptEvent}
            />
          </motion.div>
        )}

        {view === 'region' && selectedRegion && (
          <motion.div
            key="region"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full h-full"
          >
            <RegionView
              regionId={selectedRegion}
              regionName={selectedRegion}
              availableEvents={getRegionEvents()}
              onStartEvent={handleStartEvent}
              onBack={handleBackToMap}
            />
          </motion.div>
        )}

        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="w-full h-full overflow-y-auto"
          >
            {/* 返回按钮 */}
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <button
                onClick={() => setView('map')}
                className="px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-600 text-amber-100 transition-colors flex items-center gap-2"
              >
                <span>🗺️</span>
                <span>返回地图</span>
              </button>
            </div>

            <DailyEventList
              events={openWorldState.dailyEvents}
              completedEvents={openWorldState.completedEvents}
              onSelectEvent={handleStartEvent}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 事件详情弹窗 */}
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onAccept={handleAcceptEvent}
        onComplete={handleCompleteEvent}
      />

      {/* 完成界面 */}
      {showEventComplete && completedEvent && (
        <EventComplete
          event={completedEvent}
          onContinue={handleCloseComplete}
          onReturn={() => {
            handleCloseComplete();
            setView('map');
          }}
        />
      )}
    </div>
  );
}
