'use client';

import { X, Plus } from 'lucide-react';
import { Conversation } from '@/types';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversation: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  currentConversation,
  onNewChat,
  onSelectConversation,
}: SidebarProps) {
  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = new Date(conv.updatedAt);
    let key = 'Older';
    
    if (isToday(date)) {
      key = 'Today';
    } else if (isYesterday(date)) {
      key = 'Yesterday';
    } else if (isThisWeek(date)) {
      key = 'This Week';
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'M/d/yyyy');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">History</h2>
          <button onClick={onClose} className="icon-button lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <button onClick={onNewChat} className="new-chat-btn btn btn-gold">
          <Plus size={18} />
          New Chat
        </button>

        {/* Conversations List */}
        <div className="chat-list">
          {Object.entries(groupedConversations).map(([group, convs]) => (
            <div key={group} className="mb-4">
              <h3 className="text-xs font-medium text-muted px-4 py-2 uppercase tracking-wider">
                {group}
              </h3>
              {convs.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`chat-item ${conv.id === currentConversation ? 'bg-card-hover' : ''}`}
                >
                  <span className="chat-item-title">{conv.title}</span>
                  <span className="chat-item-date">{formatDate(conv.updatedAt)}</span>
                </div>
              ))}
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-8 text-muted">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
