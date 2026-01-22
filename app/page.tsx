'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import ChatInterface from '@/components/chat/ChatInterface';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import { Message, ChatContext, Conversation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [activeContext, setActiveContext] = useState<ChatContext>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('saintsalai_conversations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
      } catch (e) {
        console.error('Failed to parse stored conversations:', e);
      }
    }
  }, []);

  // Save conversations to storage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('saintsalai_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNewChat = () => {
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      userId: 'anonymous',
      title: 'New Chat',
      context: activeContext,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newId);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setMessages(conv.messages);
      setActiveContext(conv.context);
    }
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      context: activeContext,
    };

    // Update messages state
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      context: activeContext,
    };

    setMessages([...newMessages, assistantMessage]);

    try {
      // Stream response from API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: activeContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.content = fullContent;
                  }
                  return updated;
                });
              }
            } catch (e) {
              // Not JSON, might be raw text
              fullContent += data;
              setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === 'assistant') {
                  lastMsg.content = fullContent;
                }
                return updated;
              });
            }
          }
        }
      }

      // Update conversation
      const finalMessages = [...newMessages, { ...assistantMessage, content: fullContent }];
      
      if (currentConversation) {
        setConversations(prev => prev.map(c => {
          if (c.id === currentConversation) {
            return {
              ...c,
              messages: finalMessages,
              title: newMessages[0]?.content.slice(0, 50) || 'New Chat',
              updatedAt: new Date(),
            };
          }
          return c;
        }));
      } else {
        // Create new conversation
        const newConv: Conversation = {
          id: uuidv4(),
          userId: 'anonymous',
          title: content.slice(0, 50),
          context: activeContext,
          messages: finalMessages,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setConversations([newConv, ...conversations]);
        setCurrentConversation(newConv.id);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.role === 'assistant') {
          lastMsg.content = 'Sorry, I encountered an error. Please try again.';
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextChange = (context: ChatContext) => {
    setActiveContext(context);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onHistoryClick={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex flex-1 pt-[56px] pb-[72px] md:pb-0 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          currentConversation={currentConversation}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
        />

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            <WelcomeScreen onSendMessage={handleSendMessage} />
          ) : (
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />
          )}
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        activeContext={activeContext}
        onContextChange={handleContextChange}
      />
    </div>
  );
}
