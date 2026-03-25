import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question, QuestionType } from '../../systems/battle/types';

interface QuestionPanelProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onSkip?: () => void;
  timeLimit?: number;
  disabled?: boolean;
}

export default function QuestionPanel({
  question,
  onAnswer,
  onSkip,
  timeLimit,
  disabled = false,
}: QuestionPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!timeLimit || hasAnswered || disabled) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === undefined || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, hasAnswered, disabled]);

  // Auto-submit on time out
  useEffect(() => {
    if (timeRemaining === 0 && !hasAnswered) {
      handleSubmit();
    }
  }, [timeRemaining, hasAnswered]);

  const handleSubmit = useCallback(() => {
    if (hasAnswered || disabled) return;
    
    setHasAnswered(true);
    let answer = '';
    
    switch (question.type) {
      case 'input':
        answer = inputValue.trim();
        break;
      case 'judgment':
        answer = selectedOption || '';
        break;
      case 'choice':
        answer = selectedOption || '';
        break;
    }
    
    const isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();
    onAnswer(answer, isCorrect);
  }, [question, inputValue, selectedOption, hasAnswered, disabled, onAnswer]);

  const handleOptionSelect = (option: string) => {
    if (hasAnswered || disabled) return;
    setSelectedOption(option);
    
    // Auto-submit for judgment and choice types
    if (question.type === 'judgment' || question.type === 'choice') {
      setHasAnswered(true);
      const isCorrect = option.toLowerCase() === question.correctAnswer.toLowerCase();
      onAnswer(option, isCorrect);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && question.type === 'input') {
      handleSubmit();
    }
  };

  // Reset state when question changes
  useEffect(() => {
    setInputValue('');
    setSelectedOption(null);
    setShowHint(false);
    setTimeRemaining(timeLimit);
    setHasAnswered(false);
  }, [question.id, timeLimit]);

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'input':
        return '输入题';
      case 'judgment':
        return '判断题';
      case 'choice':
        return '选择题';
      default:
        return '';
    }
  };

  const getKnowledgeTypeLabel = (type: Question['knowledgeType']) => {
    switch (type) {
      case 'name':
        return '名称';
      case 'properties':
        return '性味';
      case 'effects':
        return '功效';
      case 'formula':
        return '方剂';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {getQuestionTypeLabel(question.type)}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {getKnowledgeTypeLabel(question.knowledgeType)}
          </span>
        </div>
        {timeLimit && (
          <div className={`text-sm font-medium ${
            timeRemaining !== undefined && timeRemaining <= 5 ? 'text-red-500' : 'text-gray-600'
          }`}>
            剩余时间: {timeRemaining}s
          </div>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Answer Area */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          {question.type === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled || hasAnswered}
                placeholder="请输入答案..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg disabled:bg-gray-100"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                按 Enter 提交答案
              </p>
            </motion.div>
          )}

          {question.type === 'judgment' && (
            <motion.div
              key="judgment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4"
            >
              {['正确', '错误'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  disabled={disabled || hasAnswered}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 font-medium text-lg transition-all ${
                    selectedOption === option
                      ? option === '正确'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  } disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              ))}
            </motion.div>
          )}

          {question.type === 'choice' && question.options && (
            <motion.div
              key="choice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-3"
            >
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={disabled || hasAnswered}
                  className={`w-full py-3 px-4 rounded-xl border-2 text-left font-medium transition-all ${
                    selectedOption === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  } disabled:cursor-not-allowed`}
                >
                  <span className="inline-block w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-center leading-8 mr-3 text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint Section */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
          >
            <p className="text-yellow-800 text-sm">
              <span className="font-medium">提示：</span>
              {question.hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showHint ? '隐藏提示' : '显示提示'}
        </button>

        <div className="flex gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              disabled={disabled || hasAnswered}
              className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-600 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              跳过
            </button>
          )}
          
          {question.type === 'input' && (
            <button
              onClick={handleSubmit}
              disabled={disabled || hasAnswered || !inputValue.trim()}
              className="px-6 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
