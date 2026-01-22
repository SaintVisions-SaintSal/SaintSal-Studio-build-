'use client';

import { Clock, User, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick?: () => void;
  onHistoryClick?: () => void;
  showBack?: boolean;
  title?: string;
}

export default function Header({ 
  onMenuClick, 
  onHistoryClick,
  showBack = false,
  title,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        {showBack ? (
          <button onClick={onMenuClick} className="icon-button">
            <ArrowLeft size={20} />
          </button>
        ) : (
          <button onClick={onHistoryClick} className="icon-button" aria-label="History">
            <Clock size={20} />
          </button>
        )}
        
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="SaintSal™"
            width={36}
            height={36}
            className="header-logo"
            priority
          />
          <span className="header-title">
            {title || 'SaintSal™'}
          </span>
        </Link>
      </div>

      <div className="header-right">
        <Link href="/settings" className="icon-button" aria-label="Account">
          <User size={20} />
        </Link>
      </div>
    </header>
  );
}
