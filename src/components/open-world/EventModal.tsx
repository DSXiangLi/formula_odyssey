import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GeneratedEvent } from '../../types/openWorld';
import { getEventTypeConfig, OPEN_WORLD_REGIONS } from '../../services/openWorldService';

interface EventModalProps {
  event: GeneratedEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (eventId: string) => void;
  onComplete: (eventId: string, result: { success: boolean; answers?: number[] }) => void;
}

export default function EventModal({
  event,
  isOpen,
  onClose,
  onAccept,
  onComplete,
}: EventModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'task'>('info');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);

  if (!event) return null;

  const config = getEventTypeConfig(event.type);
  const region = OPEN_WORLD_REGIONS.find(r => r.id === event.regionId);

  const handleAccept = () => {
    onAccept(event.id);
    setActiveTab('task');
  };

  const handleSubmitAnswer = () => {
    // 验证答案
    let success = false;
    if (event.type === 'book' && event.data?.questions) {
      success = selectedAnswers.every((ans, idx) =>
        ans === event.data!.questions![idx].correctIndex
      );
    } else if (event.type === 'case') {
      // 病案需要手动验证
      success = true; // 简化处理
    } else {
      success = true;
    }

    setResultSuccess(success);
    setShowResult(true);
    onComplete(event.id, { success, answers: selectedAnswers });
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setSelectedAnswers([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              border: `2px solid ${config.color}60`,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 头部 */}
            <div
              className="relative p-6"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center text-amber-200 transition-colors"
              >
                ✕
              </button>

              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${config.color}30` }}
                >
                  {config.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-amber-100 mb-1">
                    {event.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: config.color }}>{config.name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-amber-200/70">{region?.name}</span>
                  </div>
                </div>
              </div>

              {/* 标签页切换 */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'info'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-amber-200/60 hover:text-amber-200'
                  }`}
                >
                  事件详情
                </button>
                {event.accepted && (
                  <button
                    onClick={() => setActiveTab('task')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'task'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-amber-200/60 hover:text-amber-200'
                    }`}
                  >
                    完成任务
                  </button>
                )}
              </div>
            </div>

            {/* 内容区 */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'info' ? (
                <EventInfoTab event={event} config={config} onAccept={handleAccept} />
              ) : (
                <EventTaskTab
                  event={event}
                  selectedAnswers={selectedAnswers}
                  setSelectedAnswers={setSelectedAnswers}
                  onSubmit={handleSubmitAnswer}
                />
              )}
            </div>

            {/* 结果弹窗 */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-8"
                  >
                    <div className={`text-6xl mb-4 ${resultSuccess ? 'text-green-400' : 'text-red-400'}`}>
                      {resultSuccess ? '🎉' : '💔'}
                    </div>
                    <h3 className="text-2xl font-bold text-amber-100 mb-2">
                      {resultSuccess ? '任务完成！' : '任务失败'}
                    </h3>
                    <p className="text-amber-200/70 mb-6">
                      {resultSuccess
                        ? `获得 ${event.rewards.diamonds} 💎`
                        : '再接再厉，明日再来！'}
                    </p>
                    <button
                      onClick={handleCloseResult}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold text-slate-900 transition-colors"
                    >
                      {resultSuccess ? '领取奖励' : '关闭'}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 事件详情标签页
function EventInfoTab({
  event,
  config,
  onAccept,
}: {
  event: GeneratedEvent;
  config: { color: string; name: string };
  onAccept: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* 描述 */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
        <p className="text-amber-100 leading-relaxed">{event.description}</p>
      </div>

      {/* 要求 */}
      {event.requirements && (
        <div>
          <h4 className="text-sm font-semibold text-amber-200/60 mb-2">任务要求</h4>
          <div className="flex flex-wrap gap-2">
            {event.requirements.medicines?.map(med => (
              <span
                key={med}
                className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              >
                需: {med}
              </span>
            ))}
            {event.requirements.formulas?.map(formula => (
              <span
                key={formula}
                className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30"
              >
                需: {formula}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 奖励 */}
      <div>
        <h4 className="text-sm font-semibold text-amber-200/60 mb-2">任务奖励</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <span className="text-lg">💎</span>
            <span className="font-bold text-amber-400">{event.rewards.diamonds}</span>
          </div>
          {event.rewards.skillPoints && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <span>⭐</span>
              <span className="font-bold text-purple-400">+{event.rewards.skillPoints} 技能点</span>
            </div>
          )}
          {event.rewards.title && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <span>🏆</span>
              <span className="font-bold text-yellow-400">{event.rewards.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* 接受按钮 */}
      {!event.accepted && !event.completed && (
        <button
          onClick={onAccept}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300"
          style={{
            backgroundColor: config.color,
            color: '#fff',
            boxShadow: `0 4px 20px ${config.color}40`,
          }}
        >
          接受任务
        </button>
      )}

      {event.completed && (
        <div className="w-full py-4 rounded-xl font-bold text-center text-green-400 bg-green-500/20 border border-green-500/30">
          ✓ 已完成
        </div>
      )}
    </div>
  );
}

// 任务标签页
function EventTaskTab({
  event,
  selectedAnswers,
  setSelectedAnswers,
  onSubmit,
}: {
  event: GeneratedEvent;
  selectedAnswers: number[];
  setSelectedAnswers: React.Dispatch<React.SetStateAction<number[]>>;
  onSubmit: () => void;
}) {
  const renderTaskContent = () => {
    switch (event.type) {
      case 'case':
        return (
          <CaseContent
            event={event}
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
          />
        );
      case 'book':
        return (
          <BookContent
            event={event}
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
          />
        );
      case 'spirit':
        return <SpiritContent event={event} />;
      case 'bounty':
        return <BountyContent event={event} />;
      case 'plague':
        return <PlagueContent event={event} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderTaskContent()}

      {/* 提交按钮 */}
      <button
        onClick={onSubmit}
        className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 transition-all"
      >
        提交答案
      </button>
    </div>
  );
}

// 病案内容
function CaseContent({
  event,
}: {
  event: GeneratedEvent;
  selectedAnswers: number[];
  setSelectedAnswers: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
        <h4 className="font-semibold text-amber-100 mb-3">患者信息</h4>
        <p className="text-amber-200/80">{event.data?.patientInfo}</p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
        <h4 className="font-semibold text-amber-100 mb-3">症状</h4>
        <div className="flex flex-wrap gap-2">
          {event.data?.symptoms?.map((symptom, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-300"
            >
              {symptom}
            </span>
          ))}
        </div>
      </div>

      {event.data?.pulse && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
          <h4 className="font-semibold text-amber-100 mb-2">脉象</h4>
          <p className="text-amber-200/80">{event.data.pulse}</p>
        </div>
      )}

      {event.data?.tongue && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
          <h4 className="font-semibold text-amber-100 mb-2">舌象</h4>
          <p className="text-amber-200/80">{event.data.tongue}</p>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
        <h4 className="font-semibold text-amber-100 mb-3">你的诊断</h4>
        <input
          type="text"
          placeholder="输入治法..."
          className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-amber-100 placeholder-amber-200/30 focus:border-amber-500 focus:outline-none mb-3"
        />
        <input
          type="text"
          placeholder="输入方剂..."
          className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-amber-100 placeholder-amber-200/30 focus:border-amber-500 focus:outline-none mb-3"
        />
        <input
          type="text"
          placeholder="输入君药..."
          className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-amber-100 placeholder-amber-200/30 focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

// 古籍内容
function BookContent({
  event,
  selectedAnswers,
  setSelectedAnswers,
}: {
  event: GeneratedEvent;
  selectedAnswers: number[];
  setSelectedAnswers: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const handleSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-900/20 rounded-xl p-4 border border-amber-500/30">
        <h4 className="font-semibold text-amber-100 mb-2 flex items-center gap-2">
          📜 古籍残页
        </h4>
        <p className="text-amber-200/80 italic">{event.data?.bookContent}</p>
      </div>

      {event.data?.questions?.map((q, qIdx) => (
        <div key={qIdx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h4 className="font-semibold text-amber-100 mb-3">{q.question}</h4>
          <div className="space-y-2">
            {q.options.map((option, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleSelect(qIdx, oIdx)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedAnswers[qIdx] === oIdx
                    ? 'bg-amber-500/30 border-2 border-amber-500 text-amber-100'
                    : 'bg-slate-700/50 border border-slate-600 text-amber-200/70 hover:bg-slate-600/50'
                }`}
              >
                {String.fromCharCode(65 + oIdx)}. {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 药灵对话内容
function SpiritContent({ event }: { event: GeneratedEvent }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center text-2xl">
          👻
        </div>
        <div className="flex-1 bg-purple-900/20 rounded-xl p-4 border border-purple-500/30">
          <p className="text-purple-100">
            {event.data?.dialogues?.find(d => d.speaker === 'spirit')?.content}
          </p>
        </div>
      </div>

      <div className="text-center text-amber-200/60 text-sm">
        点击回复药灵...
      </div>
    </div>
  );
}

// 追缉令内容
function BountyContent({ event }: { event: GeneratedEvent }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
        <h4 className="font-semibold text-blue-100 mb-2 flex items-center gap-2">
          ⚔️ 追缉目标
        </h4>
        <p className="text-blue-200/80">
          目标方剂: <span className="font-bold">{event.data?.targetFormula}</span>
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <h4 className="font-semibold text-amber-100 mb-3">需要的药材</h4>
        <div className="flex flex-wrap gap-2">
          {event.requirements?.medicines?.map((med, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400"
            >
              {med}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// 瘟疫内容
function PlagueContent({ event }: { event: GeneratedEvent }) {
  return (
    <div className="space-y-4">
      <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
        <h4 className="font-semibold text-red-100 mb-2 flex items-center gap-2">
          ☠️ 瘟疫警报
        </h4>
        <p className="text-red-200/80">
          瘟疫类型: <span className="font-bold">{event.data?.plagueType}</span>
        </p>
      </div>

      {event.timeLimit && (
        <div className="bg-amber-900/20 rounded-xl p-4 border border-amber-500/30">
          <p className="text-amber-100 flex items-center gap-2">
            ⏱️ 剩余时间: <span className="font-bold">{event.timeLimit}分钟</span>
          </p>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <h4 className="font-semibold text-amber-100 mb-3">症状</h4>
        <div className="flex flex-wrap gap-2">
          {event.data?.symptoms?.map((symptom, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-300"
            >
              {symptom}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
