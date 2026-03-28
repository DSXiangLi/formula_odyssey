import React, { useState, useRef, useEffect } from 'react';
import { MentorMessage } from '../../services/ai/AIMentorService';
import { MentorAvatar } from './MentorAvatar';

interface DialogueBoxProps {
  messages: MentorMessage[];
  wuxing: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  messages,
  wuxing,
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div data-testid="dialogue-box" className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div data-testid="dialogue-header" className="bg-gray-100 px-4 py-2 flex items-center gap-2">
        <div data-testid="dialogue-avatar">
          <MentorAvatar expression={lastMessage?.emotion || 'happy'} wuxing={wuxing} size="sm" />
        </div>
        <span data-testid="mentor-name" className="font-medium">青木先生</span>
        {isLoading && <span data-testid="loading-indicator" className="text-xs text-gray-500">思考中...</span>}
      </div>

      {/* Messages */}
      <div data-testid="messages-container" className="h-64 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div data-testid="empty-message" className="text-center text-gray-400 py-8">
            开始与青木先生的对话...
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            data-testid={`message-${msg.role}`}
            data-message-role={msg.role}
            className={`flex gap-3 ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'mentor' && (
              <MentorAvatar expression={msg.emotion || 'happy'} wuxing={wuxing} size="sm" />
            )}
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                msg.role === 'mentor'
                  ? 'bg-blue-50 text-gray-800'
                  : 'bg-green-50 text-gray-800 ml-auto'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form data-testid="dialogue-form" onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            data-testid="dialogue-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="回复青木先生..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            data-testid="dialogue-send"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
};

export default DialogueBox;
