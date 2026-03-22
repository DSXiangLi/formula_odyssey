import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@utils/index';
import type { AnswerInputProps } from './types';

export default function AnswerInput({
  value,
  onChange,
  onSubmit,
  onAskHelp,
  onSkip,
  disabled = false,
  placeholder = '输入你的答案...',
  maxLength = 200,
}: AnswerInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value.length);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="bg-background-secondary border-t border-background-tertiary p-4">
      {/* 输入区域 */}
      <div
        className={cn(
          'relative rounded-xl transition-all duration-200',
          isFocused ? 'ring-2 ring-primary/50' : 'ring-1 ring-background-tertiary'
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onChange(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'w-full px-4 py-3 bg-background-tertiary/50 rounded-xl resize-none',
            'text-text-primary placeholder:text-text-muted',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />

        {/* 字符计数 */}
        <div className="absolute bottom-2 right-3 text-xs text-text-muted">
          {charCount}/{maxLength}
        </div>
      </div>

      {/* 按钮区域 */}
      <div className="flex items-center justify-between mt-3">
        {/* 左侧按钮 */}
        <div className="flex gap-2">
          {/* 求助按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAskHelp}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm',
              'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            <span className="text-base">💡</span>
            <span>求助师兄</span>
          </motion.button>

          {/* 跳过按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSkip}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm',
              'bg-background-tertiary/50 text-text-secondary hover:bg-background-tertiary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            <span className="text-base">⏭️</span>
            <span>跳过</span>
          </motion.button>
        </div>

        {/* 右侧提交按钮 */}
        <motion.button
          whileHover={value.trim() ? { scale: 1.05 } : {}}
          whileTap={value.trim() ? { scale: 0.95 } : {}}
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className={cn(
            'flex items-center gap-2 px-6 py-2 rounded-xl font-medium',
            'transition-all duration-200',
            value.trim()
              ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25'
              : 'bg-background-tertiary text-text-muted cursor-not-allowed'
          )}
        >
          <span>提交答案</span>
          <span className="text-sm">↵</span>
        </motion.button>
      </div>

      {/* 提示文字 */}
      <p className="mt-2 text-xs text-text-muted text-center">
        按 Enter 快速提交，Shift + Enter 换行
      </p>
    </div>
  );
}
