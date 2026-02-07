import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Header } from '../components/Header';
import { Nasheed } from '../types';
import { generateId, isArabic } from '../utils';
import { Button } from '../components/Button';

interface EditorScreenProps {
  initialData?: Nasheed | null;
  userId: string;
  onSave: (nasheed: Nasheed) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({ 
  initialData, 
  userId,
  onSave, 
  onCancel,
  onDelete
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [lyrics, setLyrics] = useState(initialData?.lyrics || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea efficiently
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Adjust height on mount and when lyrics change
  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [lyrics]);

  const handleLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLyrics(e.target.value);
    // Don't manually adjust style here, let useLayoutEffect handle it to batch updates
  };

  const handleSave = () => {
    if (!title.trim() && !lyrics.trim()) return;

    const now = Date.now();
    const nasheed: Nasheed = {
      id: initialData?.id || generateId(),
      title: title.trim() || 'শিরোনামহীন',
      lyrics: lyrics,
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
      userId,
      isFavorite: initialData?.isFavorite || false
    };

    onSave(nasheed);
  };

  // Check direction only on first 50 chars for performance
  const isRTL = isArabic(lyrics.slice(0, 50));

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header 
        title={initialData ? 'সম্পাদনা' : 'নতুন লিরিক'}
        leftAction={
          <button onClick={onCancel} className="p-2 -ml-2 text-muted hover:text-text">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
        rightAction={
          <button 
            onClick={handleSave} 
            className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium shadow-lg shadow-emerald-500/20"
          >
            সেভ করুন
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="গজলের শিরোনাম..."
          className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-600 border-none focus:outline-none focus:ring-0 px-0"
        />
        
        <textarea
          ref={textareaRef}
          value={lyrics}
          onChange={handleLyricsChange}
          placeholder="এখানে লিরিক লিখুন..."
          className={`w-full min-h-[50vh] bg-transparent text-lg text-slate-300 placeholder-slate-600 border-none focus:outline-none focus:ring-0 resize-none leading-relaxed px-0 font-sans ${isRTL ? 'font-arabic text-xl direction-rtl text-right' : ''}`}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />
      </div>

      {initialData && onDelete && (
        <div className="p-4 border-t border-slate-800 bg-dark">
          {!showDeleteConfirm ? (
            <Button 
              variant="ghost" 
              fullWidth 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              মুছে ফেলুন
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted">আপনি কি নিশ্চিত এটি ডিলিট করতে চান?</p>
              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>না</Button>
                <Button variant="danger" fullWidth onClick={() => onDelete(initialData.id)}>হ্যাঁ, মুছুন</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};