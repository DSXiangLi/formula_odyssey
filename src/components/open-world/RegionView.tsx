import { motion } from 'framer-motion';
import type { GeneratedEvent } from '../../types/openWorld';
import { OPEN_WORLD_REGIONS, getEventTypeConfig } from '../../services/openWorldService';
import { WUXING_REGIONS } from '../../stores/gameStore';

interface RegionViewProps {
  regionId: string;
  regionName: string;
  availableEvents: GeneratedEvent[];
  onStartEvent: (event: GeneratedEvent) => void;
  onBack: () => void;
}

export default function RegionView({
  regionId,
  availableEvents,
  onStartEvent,
  onBack,
}: RegionViewProps) {
  const region = OPEN_WORLD_REGIONS.find(r => r.id === regionId);
  const wuxingRegion = region ? WUXING_REGIONS[region.wuxing] : null;

  const pendingEvents = availableEvents.filter(e => !e.accepted && !e.completed);
  const acceptedEvents = availableEvents.filter(e => e.accepted && !e.completed);

  return (
    <div className="w-full h-full flex flex-col">
      {/* 背景 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${region?.backgroundImage || '/images/scenes/default.jpg'})`,
          filter: 'brightness(0.4)',
        }}
      />

      {/* 内容 */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-600 text-amber-100 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>返回地图</span>
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
              {wuxingRegion?.name}
              <span className="text-sm font-normal text-amber-200/60">
                ({getWuxingName(region?.wuxing)})
              </span>
            </h1>
            <p className="text-amber-200/60 text-sm">{region?.description}</p>
          </div>

          {/* 区域特性 */}
          <div
            className="px-4 py-2 rounded-xl text-sm"
            style={{
              backgroundColor: `${wuxingRegion?.themeColor}30`,
              border: `1px solid ${wuxingRegion?.themeColor}`,
              color: wuxingRegion?.themeColorLight,
            }}
          >
            {wuxingRegion?.specialMechanism}
          </div>
        </motion.div>

        {/* 事件列表 */}
        <div className="flex-1 overflow-y-auto">
          {/* 进行中 */}
          {acceptedEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <span>▶</span>
                <span>进行中的任务</span>
              </h3>
              <div className="space-y-3">
                {acceptedEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onStartEvent(event)}
                    index={index}
                    status="accepted"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* 可接取 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <span>📍</span>
              <span>随机遭遇</span>
            </h3>
            {pendingEvents.length === 0 ? (
              <div className="text-center py-12 text-amber-200/50">
                <div className="text-4xl mb-3">🍃</div>
                <p>此区域暂无新事件</p>
                <p className="text-sm mt-1">明日再来探索吧</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onStartEvent(event)}
                    index={index}
                    status="pending"
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* 探索提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-amber-500/20"
        >
          <p className="text-amber-200/70 text-sm text-center">
            💡 在此区域探索时，{wuxingRegion?.specialMechanism}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// 事件卡片
function EventCard({
  event,
  onClick,
  index,
  status,
}: {
  event: GeneratedEvent;
  onClick: () => void;
  index: number;
  status: 'pending' | 'accepted';
}) {
  const config = getEventTypeConfig(event.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 rounded-xl cursor-pointer transition-all border"
      style={{
        backgroundColor: status === 'accepted' ? 'rgba(30, 64, 175, 0.2)' : config.bgColor,
        borderColor: status === 'accepted' ? 'rgba(59, 130, 246, 0.5)' : `${config.color}40`,
        borderLeftWidth: '4px',
        borderLeftColor: config.color,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${config.color}30` }}
        >
          {config.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-amber-100 mb-1">{event.title}</h4>
          <p className="text-sm text-amber-200/60 line-clamp-1">{event.description}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-400">
            <span>💎</span>
            <span className="font-bold">{event.rewards.diamonds}</span>
          </div>
          {status === 'accepted' && (
            <span className="text-xs text-blue-400">进行中</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getWuxingName(wuxing?: string): string {
  const names: Record<string, string> = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
  };
  return names[wuxing || ''] || '';
}
