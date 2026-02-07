import React from 'react';
import { Nasheed } from '../types';
import { formatDate, isArabic } from '../utils';

interface ReaderScreenProps {
  nasheed: Nasheed;
  onBack: () => void;
  onEdit: () => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ nasheed, onBack, onEdit }) => {
  const isRTL = isArabic(nasheed.lyrics);

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Immersive Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-dark via-dark/95 to-transparent">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <button 
          onClick={onEdit}
          className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-6 pb-20 max-w-2xl mx-auto w-full">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold text-white leading-tight">{nasheed.title}</h1>
          <p className="text-xs text-muted uppercase tracking-wider">
            {formatDate(nasheed.updatedAt)}
          </p>
        </div>

        <div 
          className={`prose prose-invert prose-lg max-w-none whitespace-pre-wrap leading-loose ${isRTL ? 'text-right font-arabic text-2xl' : 'text-left font-sans'}`}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
          {nasheed.lyrics}
        </div>
      </div>
    </div>
  );
};