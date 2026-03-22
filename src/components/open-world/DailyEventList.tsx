import { motion, AnimatePresence } from 'framer-motion';
import type { GeneratedEvent } from '../../types/openWorld';
import { getEventTypeConfig, getDifficultyLabel, getDifficultyColor } from '../../services/openWorldService';

interface DailyEventListProps {
  events: GeneratedEvent[];
  completedEvents: string[];
  onSelectEvent: (event: GeneratedEvent) => void;
}

export default function DailyEventList({
  events,
  completedEvents,
  onSelectEvent,
}: DailyEventListProps) {
  // 按状态分组
  const pendingEvents = events.filter(e => !e.accepted && !completedEvents.includes(e.id));
  const acceptedEvents = events.filter(e => e.accepted && !completedEvents.includes(e.id));
  const finishedEvents = events.filter(e => completedEvents.includes(e.id));

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-amber-100 mb-1">📅 今日事件</h2>
        <p className="text-amber-200/70 text-sm">完成事件获得丰厚奖励</p>
      </motion.div>

      {/* 进行中事件 */}
      {acceptedEvents.length > 0 && (
        <EventSection title="进行中" count={acceptedEvents.length} color="#2196F3">
          {acceptedEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              status="accepted"
              onClick={() => onSelectEvent(event)}
              index={index}
            />
          ))}
        </EventSection>
      )}

      {/* 待接受事件 */}
      <EventSection title="待接受" count={pendingEvents.length} color="#4CAF50">
        {pendingEvents.length === 0 ? (
          <EmptyState message="今日所有事件已接受或暂无新事件" />
        ) : (
          pendingEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              status="pending"
              onClick={() => onSelectEvent(event)}
              index={index}
            />
          ))
        )}
      </EventSection>

      {/* 已完成事件 */}
      {finishedEvents.length > 0 && (
        <EventSection title="已完成" count={finishedEvents.length} color="#9E9E9E">
          {finishedEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              status="completed"
              onClick={() => onSelectEvent(event)}
              index={index}
            />
          ))}
        </EventSection>
      )}
    </div>
  );
}

// 事件分区组件
function EventSection({
  title,
  count,
  color,
  children,
}: {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h3 className="text-lg font-semibold text-amber-100">{title}</h3>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${color}30`, color }}
        >
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </motion.div>
  );
}

// 事件卡片组件
interface EventCardProps {
  event: GeneratedEvent;
  status: 'pending' | 'accepted' | 'completed';
  onClick: () => void;
  index: number;
}

function EventCard({ event, status, onClick, index }: EventCardProps) {
  const config = getEventTypeConfig(event.type);
  const difficultyLabel = getDifficultyLabel(event.difficulty);
  const difficultyColor = getDifficultyColor(event.difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all duration-300
        border-l-4
        ${status === 'completed' ? 'opacity-60' : ''}
      `}
      style={{
        backgroundColor: status === 'completed' ? 'rgba(30, 41, 59, 0.5)' : config.bgColor,
        borderLeftColor: config.color,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-start gap-4">
        {/* 类型图标 */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: `${config.color}20` }}
        >
          {config.icon}
        </div>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-amber-100 truncate">{event.title}</h4>
            {status === 'completed' && (
              <span className="text-green-400 text-lg">✓</span>
            )}
            {status === 'accepted' && (
              <span className="text-blue-400 text-lg">▶</span>
            )}
          </div>

          <p className="text-sm text-amber-200/70 line-clamp-2 mb-2">
            {event.description}
          </p>

          {/* 标签行 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 难度标签 */}
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${difficultyColor}30`,
                color: difficultyColor,
              }}
            >
              {difficultyLabel}
            </span>

            {/* 类型标签 */}
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${config.color}30`,
                color: config.color,
              }}
            >
              {config.name}
            </span>

            {/* 限时标记 */}
            {event.timeLimit && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/30 text-red-400">
                ⏱️ {event.timeLimit}分钟
              </span>
            )}

            {/* 状态标签 */}
            {status === 'accepted' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/30 text-blue-400">
                进行中
              </span>
            )}
          </div>
        </div>

        {/* 奖励预览 */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-amber-400">
            <span className="text-lg">💎</span>
            <span className="font-bold">{event.rewards.diamonds}</span>
          </div>
          {event.rewards.skillPoints && (
            <div className="flex items-center gap-1 text-purple-400 text-xs">
              <span>⭐</span>
              <span>+{event.rewards.skillPoints}</span>
            </div>
          )}
          {event.rewards.title && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <span>🏆</span>
              <span>{event.rewards.title}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// 空状态组件
function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 text-center text-amber-200/50"
    >
      <div className="text-4xl mb-2">🍃</div>
      <p className="text-sm">{message}</p>
    </motion.div>
  );
}
