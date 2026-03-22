import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@utils/index';
import type { DialogBubbleProps, DialogRole, RoleConfig } from './types';
import { ROLE_CONFIG } from './types';

interface DialogBubbleComponentProps extends DialogBubbleProps {
  onTypingComplete?: () => void;
}

export default function DialogBubble({
  role,
  content,
  isTyping = false,
  showAvatar = true,
  className,
  onTypingComplete,
}: DialogBubbleComponentProps) {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : content);
  const [isTypingComplete, setIsTypingComplete] = useState(!isTyping);
  const config = ROLE_CONFIG[role];

  // 打字机效果
  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(content);
      setIsTypingComplete(true);
      return;
    }

    setDisplayedText('');
    setIsTypingComplete(false);
    let index = 0;
    const speed = 30; // 每个字符间隔30ms

    const timer = setInterval(() => {
      if (index < content.length) {
        setDisplayedText(content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTypingComplete(true);
        onTypingComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [content, isTyping, onTypingComplete]);

  const isLeft = config.position === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex gap-3 mb-4',
        isLeft ? 'flex-row' : 'flex-row-reverse',
        className
      )}
    >
      {/* 头像 */}
      {showAvatar && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0',
            'shadow-md border-2',
            isLeft ? 'border-white/50' : 'border-green-500/50'
          )}
          style={{ backgroundColor: config.color }}
        >
          {config.avatar}
        </motion.div>
      )}

      {/* 气泡内容 */}
      <div className={cn('flex flex-col', isLeft ? 'items-start' : 'items-end')}>
        {/* 角色名 */}
        <span className="text-xs text-text-secondary mb-1 px-2">{config.name}</span>

        {/* 气泡 */}
        <div
          className={cn(
            'relative px-4 py-3 rounded-2xl max-w-md',
            'shadow-md transition-all duration-200',
            isLeft ? config.bgColor : 'bg-green-100',
            isLeft ? 'rounded-tl-sm' : 'rounded-tr-sm'
          )}
        >
          {/* 气泡指向三角形 */}
          <div
            className={cn(
              'absolute top-0 w-3 h-3',
              isLeft ? '-left-1.5' : '-right-1.5'
            )}
            style={{
              background: isLeft
                ? config.bgColor.replace('bg-', '')
                : 'bg-green-100'.replace('bg-', ''),
            }}
          >
            <div
              className={cn(
                'absolute w-0 h-0',
                isLeft
                  ? 'left-0 top-0 border-t-[6px] border-t-transparent border-r-[6px]'
                  : 'right-0 top-0 border-t-[6px] border-t-transparent border-l-[6px]'
              )}
              style={{
                borderRightColor: isLeft ? 'currentColor' : 'transparent',
                borderLeftColor: isLeft ? 'transparent' : 'currentColor',
                color: isLeft
                  ? config.bgColor.replace('bg-', '')
                  : 'bg-green-100'.replace('bg-', ''),
              }}
            />
          </div>

          {/* 文字内容 */}
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {displayedText}
            {!isTypingComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-text-primary ml-0.5 align-middle"
              />
            )}
          </p>
        </div>

        {/* 时间戳 */}
        <span className="text-xs text-text-muted mt-1 px-2">
          {new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}
