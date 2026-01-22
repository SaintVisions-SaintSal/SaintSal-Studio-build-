'use client';

import { MessageSquare, Home, BarChart3, Users, Banknote, FileText } from 'lucide-react';
import { ChatContext } from '@/types';

interface BottomNavProps {
  activeContext: ChatContext;
  onContextChange: (context: ChatContext) => void;
}

const navItems: { id: ChatContext; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'property', label: 'Property', icon: Home },
  { id: 'analyzer', label: 'Analyzer', icon: BarChart3 },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'loans', label: 'Loans', icon: Banknote },
  { id: 'apply', label: 'Apply', icon: FileText },
];

export default function BottomNav({ activeContext, onContextChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeContext === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onContextChange(item.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon 
              size={22} 
              className="nav-icon" 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
