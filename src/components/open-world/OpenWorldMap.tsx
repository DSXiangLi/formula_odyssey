import { motion } from 'framer-motion';
import type { GeneratedEvent, OpenWorldRegion } from '../../types/openWorld';
import { getEventTypeConfig, getDifficultyColor, getUnlockedRegions } from '../../services/openWorldService';

interface OpenWorldMapProps {
  unlockedRegions: string[];
  dailyEvents: GeneratedEvent[];
  completedEvents: string[];
  onEnterRegion: (regionId: string) => void;
  onAcceptEvent: (eventId: string) => void;
}

const WUXING_COLORS: Record<string, { primary: string; light: string; gradient: string }> = {
  wood: {
    primary: '#2E7D32',
    light: '#81C784',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
  },
  fire: {
    primary: '#C62828',
    light: '#EF5350',
    gradient: 'linear-gradient(135deg, #C62828 0%, #FF7043 100%)',
  },
  earth: {
    primary: '#F9A825',
    light: '#FFD54F',
    gradient: 'linear-gradient(135deg, #F9A825 0%, #FFCA28 100%)',
  },
  metal: {
    primary: '#78909C',
    light: '#B0BEC5',
    gradient: 'linear-gradient(135deg, #78909C 0%, #90A4AE 100%)',
  },
  water: {
    primary: '#1565C0',
    light: '#42A5F5',
    gradient: 'linear-gradient(135deg, #1565C0 0%, #29B6F6 100%)',
  },
};

export default function OpenWorldMap({
  unlockedRegions,
  dailyEvents,
  completedEvents,
  onEnterRegion,
}: OpenWorldMapProps) {
  const regions = getUnlockedRegions(unlockedRegions);

  // 获取区域的事件数量
  const getEventCountForRegion = (regionId: string) => {
    return dailyEvents.filter(
      e => e.regionId === regionId && !completedEvents.includes(e.id) && !e.accepted
    ).length;
  };

  // 获取区域已接受但未完成的事件
  const getAcceptedEventCount = (regionId: string) => {
    return dailyEvents.filter(
      e => e.regionId === regionId && e.accepted && !completedEvents.includes(e.id)
    ).length;
  };

  return (
    <div className="w-full h-full p-6 overflow-hidden">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-amber-100 mb-2">🗺️ 开放世界</h1>
        <p className="text-amber-200/70">探索已解锁的山谷，发现每日随机事件</p>
      </motion.div>

      {/* 大地图容器 */}
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-amber-500/30 shadow-2xl">
        {/* 地图背景纹理 */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* 连接线 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {regions.map((region, index) => {
            const nextRegion = regions[index + 1];
            if (!nextRegion) return null;
            const x1 = getRegionPosition(region.wuxing).x;
            const y1 = getRegionPosition(region.wuxing).y;
            const x2 = getRegionPosition(nextRegion.wuxing).x;
            const y2 = getRegionPosition(nextRegion.wuxing).y;
            return (
              <motion.line
                key={`line-${region.id}`}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="rgba(212, 165, 116, 0.3)"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            );
          })}
        </svg>

        {/* 区域节点 */}
        {regions.map((region, index) => {
          const pos = getRegionPosition(region.wuxing);
          const eventCount = getEventCountForRegion(region.id);
          const acceptedCount = getAcceptedEventCount(region.id);
          const colors = WUXING_COLORS[region.wuxing];

          return (
            <motion.div
              key={region.id}
              className="absolute cursor-pointer"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.15, type: 'spring' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEnterRegion(region.id)}
            >
              {/* 区域节点 */}
              <div
                className="relative w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl border-2 transition-all duration-300"
                style={{
                  background: colors.gradient,
                  borderColor: colors.light,
                  boxShadow: `0 0 30px ${colors.primary}40`,
                }}
              >
                {/* 区域图标 */}
                <span className="text-3xl mb-1">
                  {getWuxingIcon(region.wuxing)}
                </span>
                <span className="text-xs font-bold text-white drop-shadow-md">
                  {region.name}
                </span>

                {/* 新事件标记 */}
                {eventCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <span className="text-xs font-bold text-white">{eventCount}</span>
                  </motion.div>
                )}

                {/* 进行中标记 */}
                {acceptedCount > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">!</span>
                  </div>
                )}

                {/* 悬停提示 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800/90 px-3 py-1.5 rounded-lg text-xs text-amber-100 border border-amber-500/30 pointer-events-none z-10"
                >
                  {region.description}
                </motion.div>
              </div>
            </motion.div>
          );
        })}

        {/* 中央提示 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-amber-200/60 text-sm">
            点击区域进入探索 · 红点表示有新事件
          </p>
        </div>
      </div>

      {/* 今日统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 grid grid-cols-3 gap-4"
      >
        <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20 text-center">
          <div className="text-2xl font-bold text-amber-400">{dailyEvents.length}</div>
          <div className="text-xs text-amber-200/60">今日事件</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20 text-center">
          <div className="text-2xl font-bold text-green-400">{completedEvents.length}</div>
          <div className="text-xs text-amber-200/60">已完成</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20 text-center">
          <div className="text-2xl font-bold text-blue-400">{regions.length}</div>
          <div className="text-xs text-amber-200/60">已解锁区域</div>
        </div>
      </motion.div>
    </div>
  );
}

// 获取五行对应的图标
function getWuxingIcon(wuxing: string): string {
  const icons: Record<string, string> = {
    wood: '🌿',
    fire: '🔥',
    earth: '⛰️',
    metal: '⚔️',
    water: '💧',
  };
  return icons[wuxing] || '📍';
}

// 获取区域在地图上的位置（圆形布局）
function getRegionPosition(wuxing: string): { x: number; y: number } {
  const positions: Record<string, { x: number; y: number }> = {
    wood: { x: 50, y: 15 },    // 上方
    fire: { x: 80, y: 35 },    // 右上
    earth: { x: 50, y: 50 },   // 中心
    metal: { x: 20, y: 35 },   // 左上
    water: { x: 50, y: 85 },   // 下方
  };
  return positions[wuxing] || { x: 50, y: 50 };
}
