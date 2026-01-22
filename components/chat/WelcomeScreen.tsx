'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import Image from 'next/image';

interface WelcomeScreenProps {
  onSendMessage: (content: string) => void;
}

export default function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  const [input, setInput] = useState('');
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
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = [
    "Research a property at 123 Main St",
    "Find leads in Orange County",
    "Calculate ROI on a fix and flip",
    "What loans are available for investors?",
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Welcome Content */}
      <div className="welcome-container flex-1">
        <Image
          src="/images/logo.png"
          alt="SaintSal™"
          width={80}
          height={80}
          className="welcome-logo"
          priority
        />
        <h1 className="welcome-title">SaintSal™</h1>
        <p className="welcome-subtitle">
          Research properties, analyze ROI, find leads, explore lending options.
        </p>

        {/* Quick Prompts */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-md">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(prompt)}
              className="px-4 py-2 text-sm bg-card border border-border rounded-full hover:border-gold-500 hover:text-gold-400 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <button 
            className="icon-button flex-shrink-0"
            aria-label="Voice input"
          >
            <Mic size={20} />
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask SaintSal anything..."
            className="chat-input"
            rows={1}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
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
