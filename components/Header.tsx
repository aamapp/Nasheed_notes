import React from 'react';

interface HeaderProps {
  title?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, leftAction, rightAction }) => {
  return (
    <header className="sticky top-0 z-50 bg-dark/80 backdrop-blur-md border-b border-slate-800 h-16 px-4 flex items-center justify-between">
      <div className="flex-1 flex justify-start">
        {leftAction}
      </div>
      <div className="flex-2 text-center">
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          {title || 'নাশিদ নোট'}
        </h1>
      </div>
      <div className="flex-1 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
};