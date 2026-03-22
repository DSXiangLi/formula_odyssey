// AI对话组件类型定义

// 对话角色
export type DialogRole = 'elder' | 'socrates' | 'player';

// 对话轮次
export interface ConversationTurn {
  role: DialogRole;
  content: string;
  timestamp: number;
  metadata?: {
    questionType?: string;
    isCorrect?: boolean;
    hintUsed?: boolean;
  };
}

// 问题类型
export type QuestionType = 'single' | 'compare' | 'formula' | 'cross_chapter';

// 问题数据
export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  difficulty: number; // 1-5
  hintAvailable: boolean;
  expectedKeywords: string[];
  reference?: string; // 引用经典出处
  sceneDescription?: string; // 场景描述（用于UI展示）
}

// 苏格拉底引导响应
export interface SocraticResponse {
  responseType: 'guide' | 'answer';
  content: string;
  nextQuestion?: string; // 如果继续引导，下一个问题
  giveUp: boolean; // 是否建议放弃引导直接给答案
}

// AI对话组件Props
export interface AIDialogProps {
  question: Question;
  conversationHistory: ConversationTurn[];
  onSubmit: (answer: string) => void;
  onAskHelp: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

// 对话气泡Props
export interface DialogBubbleProps {
  role: DialogRole;
  content: string;
  isTyping?: boolean;
  showAvatar?: boolean;
  className?: string;
}

// 答案输入Props
export interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAskHelp: () => void;
  onSkip: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

// 求助弹窗Props
export interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  socraticResponse: SocraticResponse;
  onContinue: () => void;
  onShowAnswer: () => void;
  conversationRound: number; // 当前对话轮数
}

// 答题反馈Props
export interface FeedbackProps {
  isCorrect: boolean;
  correctAnswer?: string;
  playerAnswer: string;
  reward?: {
    diamonds: number;
    affinityBonus?: number;
    title?: string;
  };
  explanation?: string;
  onNext: () => void;
  onRetry: () => void;
  onAskHelp: () => void;
}

// 角色配置
export interface RoleConfig {
  name: string;
  avatar: string;
  color: string;
  bgColor: string;
  position: 'left' | 'right';
}

// 角色配置映射
export const ROLE_CONFIG: Record<DialogRole, RoleConfig> = {
  elder: {
    name: '老顽童',
    avatar: '👴',
    color: '#F9A825',
    bgColor: 'bg-amber-100',
    position: 'left',
  },
  socrates: {
    name: '师兄',
    avatar: '🧑‍🎓',
    color: '#42A5F5',
    bgColor: 'bg-blue-100',
    position: 'left',
  },
  player: {
    name: '我',
    avatar: '🧑‍⚕️',
    color: '#66BB6A',
    bgColor: 'bg-green-100',
    position: 'right',
  },
};
