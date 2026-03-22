import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@utils/index';
import DialogBubble from './DialogBubble';
import AnswerInput from './AnswerInput';
import HintModal from './HintModal';
import Feedback from './Feedback';
import type {
  AIDialogProps,
  DialogRole,
  ConversationTurn,
  Question,
  SocraticResponse,
} from './types';
import { ROLE_CONFIG } from './types';

// 反馈状态
interface FeedbackState {
  show: boolean;
  isCorrect: boolean;
  playerAnswer: string;
  reward?: {
    diamonds: number;
    affinityBonus?: number;
    title?: string;
  };
  explanation?: string;
}

export default function AIDialog({
  question,
  conversationHistory,
  onSubmit,
  onAskHelp,
  onSkip,
  isLoading = false,
}: AIDialogProps) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [socraticResponse, setSocraticResponse] = useState<SocraticResponse | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [typingComplete, setTypingComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory, feedback, typingComplete]);

  // 处理提交答案
  const handleSubmit = () => {
    if (!answer.trim() || isLoading) return;
    onSubmit(answer.trim());
    setAnswer('');
  };

  // 处理求助
  const handleAskHelp = () => {
    // 模拟苏格拉底响应
    const mockResponse: SocraticResponse = {
      responseType: 'guide',
      content: '师弟，你再想想。这道题考查的是药物的四气五味，你能否回忆一下《神农本草经》中是如何描述这味药的？',
      nextQuestion: '这味药的性味是偏寒还是偏温？',
      giveUp: false,
    };
    setSocraticResponse(mockResponse);
    setShowHint(true);
    onAskHelp();
  };

  // 处理跳过
  const handleSkip = () => {
    onSkip();
  };

  // 继续引导
  const handleContinue = () => {
    setShowHint(false);
    setSocraticResponse(null);
  };

  // 显示答案
  const handleShowAnswer = () => {
    const mockAnswerResponse: SocraticResponse = {
      responseType: 'answer',
      content: '好吧，为师直接告诉你。这道题的正确答案是：麻黄。麻黄性温，味辛，归肺、膀胱经，具有发汗解表、宣肺平喘的功效。《本草备要》说："麻黄辛苦温，入肺、膀胱经。"记住了吗？',
      giveUp: true,
    };
    setSocraticResponse(mockAnswerResponse);
  };

  // 显示反馈（示例）
  const showFeedback = (isCorrect: boolean) => {
    setFeedback({
      show: true,
      isCorrect,
      playerAnswer: answer,
      reward: isCorrect
        ? {
            diamonds: 100,
            affinityBonus: 20,
            title: '慧眼识药',
          }
        : undefined,
      explanation: isCorrect
        ? '麻黄为麻黄科植物的草质茎，性温味辛，归肺、膀胱经。具有发汗解表、宣肺平喘、利水消肿的功效。'
        : undefined,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-background-secondary rounded-2xl border border-background-tertiary shadow-2xl overflow-hidden">
      {/* 场景描述（如果有） */}
      {question.sceneDescription && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 to-transparent p-4 border-b border-background-tertiary"
        >
          <p className="text-sm text-text-secondary italic">
            📖 场景：{question.sceneDescription}
          </p>
        </motion.div>
      )}

      {/* 对话历史 */}
      <div
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 space-y-2 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {conversationHistory.map((turn, index) => (
            <DialogBubble
              key={`${turn.timestamp}-${index}`}
              role={turn.role as DialogRole}
              content={turn.content}
              isTyping={index === conversationHistory.length - 1 && !typingComplete}
              showAvatar={true}
              onTypingComplete={() => setTypingComplete(true)}
            />
          ))}

          {/* 当前问题 */}
          {conversationHistory.length === 0 && (
            <DialogBubble
              role="elder"
              content={question.question}
              isTyping={true}
              showAvatar={true}
              onTypingComplete={() => setTypingComplete(true)}
            />
          )}
        </AnimatePresence>

        {/* 引用经典（如果有） */}
        {question.reference && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="ml-14 mt-2 bg-amber-50/50 border border-amber-200/50 rounded-lg p-3"
          >
            <p className="text-xs text-amber-700 font-medium mb-1">📜 经典引用</p>
            <p className="text-xs text-text-secondary italic">{question.reference}</p>
          </motion.div>
        )}

        {/* 反馈区域 */}
        {feedback?.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4"
          >
            <Feedback
              isCorrect={feedback.isCorrect}
              correctAnswer="麻黄"
              playerAnswer={feedback.playerAnswer}
              reward={feedback.reward}
              explanation={feedback.explanation}
              onNext={() => {
                setFeedback(null);
                // 触发下一题逻辑
              }}
              onRetry={() => {
                setFeedback(null);
              }}
              onAskHelp={() => {
                setFeedback(null);
                handleAskHelp();
              }}
            />
          </motion.div>
        )}
      </div>

      {/* 加载指示器 */}
      {isLoading && (
        <div className="flex justify-center py-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 text-text-secondary text-sm"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
            <span>老顽童正在思考...</span>
          </motion.div>
        </div>
      )}

      {/* 输入区域 */}
      {!feedback?.show && (
        <AnswerInput
          value={answer}
          onChange={setAnswer}
          onSubmit={handleSubmit}
          onAskHelp={handleAskHelp}
          onSkip={handleSkip}
          disabled={isLoading || !typingComplete}
          placeholder="输入你的答案..."
        />
      )}

      {/* 求助弹窗 */}
      {socraticResponse && (
        <HintModal
          isOpen={showHint}
          onClose={() => setShowHint(false)}
          socraticResponse={socraticResponse}
          onContinue={handleContinue}
          onShowAnswer={handleShowAnswer}
          conversationRound={1}
        />
      )}
    </div>
  );
}
