'use client';

import { useState, useRef, useEffect, RefObject } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Message } from '@/types';
import ChatMessage from './ChatMessage';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export default function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  return (
    <div className="chat-container">
      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'assistant' && 
          messages[messages.length - 1]?.content === '' && (
          <div className="message message-assistant">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <button 
            onClick={toggleVoice}
            className={`icon-button flex-shrink-0 ${isListening ? 'text-gold-400' : ''}`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask SaintSal anything..."
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="send-button"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
