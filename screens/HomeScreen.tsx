import React, { useState } from 'react';
import { Header } from '../components/Header';
import { EmptyState } from '../components/EmptyState';
import { Nasheed, User } from '../types';
import { formatDate, isArabic } from '../utils';

interface HomeScreenProps {
  nasheeds: Nasheed[];
  user: User;
  onCreate: () => void;
  onSelect: (nasheed: Nasheed) => void;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  nasheeds, 
  user,
  onCreate, 
  onSelect,
  onLogout 
}) => {
  const [search, setSearch] = useState('');

  const filteredNasheeds = nasheeds.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.lyrics.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark flex flex-col relative">
      <Header 
        leftAction={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {user.email[0].toUpperCase()}
            </div>
          </div>
        }
        rightAction={
          <button onClick={onLogout} className="text-xs font-medium text-muted hover:text-red-400">
            লগ আউট
          </button>
        }
      />

      {/* Search Bar */}
      <div className="p-4 sticky top-16 z-40 bg-dark/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="গজল খুঁজুন..."
            className="w-full bg-card border border-slate-700 text-text rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 p-4 pb-24 space-y-3">
        {filteredNasheeds.length === 0 ? (
          <EmptyState 
            message={search ? 'কোনো ফলাফল পাওয়া যায়নি' : 'কোনো লিরিক নেই'}
            subMessage={search ? 'অন্য কিছু লিখে চেষ্টা করুন' : 'নতুন একটি লিরিক যোগ করতে নিচের বাটনে চাপ দিন'}
          />
        ) : (
          filteredNasheeds.map(nasheed => (
            <div 
              key={nasheed.id}
              onClick={() => onSelect(nasheed)}
              className="group bg-card hover:bg-slate-700/50 border border-slate-700/50 rounded-xl p-4 transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-slate-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {nasheed.title}
                </h3>
              </div>
              <p 
                className={`text-sm text-slate-400 line-clamp-2 mb-3 ${isArabic(nasheed.lyrics) ? 'font-arabic text-right' : ''}`}
                style={{ direction: isArabic(nasheed.lyrics) ? 'rtl' : 'ltr' }}
              >
                {nasheed.lyrics}
              </p>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>{formatDate(nasheed.updatedAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onCreate}
        className="fixed right-5 bottom-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-50"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};