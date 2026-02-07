import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { EmptyState } from '../components/EmptyState';
import { Nasheed, User } from '../types';
import { formatDate, isArabic } from '../utils';

interface HomeScreenProps {
  nasheeds: Nasheed[];
  user: User;
  onCreate: () => void;
  onSelect: (nasheed: Nasheed) => void;
  onEdit: (nasheed: Nasheed) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  nasheeds, 
  user,
  onCreate, 
  onSelect,
  onEdit,
  onDelete,
  onLogout 
}) => {
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Optimize filtering with useMemo
  const filteredNasheeds = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    if (!lowerSearch) return nasheeds;

    return nasheeds.filter(n => 
      n.title.toLowerCase().includes(lowerSearch) || 
      n.lyrics.toLowerCase().includes(lowerSearch)
    );
  }, [nasheeds, search]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (window.confirm("আপনি কি নিশ্চিত এই লিরিকটি মুছে ফেলতে চান?")) {
      onDelete(id);
    }
  };

  const handleEditClick = (e: React.MouseEvent, nasheed: Nasheed) => {
    e.stopPropagation();
    setOpenMenuId(null);
    onEdit(nasheed);
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col relative">
      <Header 
        leftAction={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm select-none">
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
          filteredNasheeds.map(nasheed => {
            const previewText = nasheed.lyrics.slice(0, 100);
            const isRTL = isArabic(previewText);
            const isMenuOpen = openMenuId === nasheed.id;
            
            return (
              <div 
                key={nasheed.id}
                onClick={() => onSelect(nasheed)}
                className="group relative bg-card hover:bg-slate-700/50 border border-slate-700/50 rounded-xl p-4 transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-100 line-clamp-1 pr-8 group-hover:text-emerald-400 transition-colors font-sans">
                    {nasheed.title}
                  </h3>
                  
                  {/* Menu Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : nasheed.id);
                    }}
                    className="absolute top-3 right-2 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-600/50 transition-colors z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-2 top-10 z-20 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={(e) => handleEditClick(e, nasheed)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        এডিট
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, nasheed.id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        ডিলিট
                      </button>
                    </div>
                  )}
                </div>
                
                <p 
                  className={`text-sm text-slate-400 line-clamp-2 mb-3 ${isRTL ? 'font-arabic text-right' : ''}`}
                  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                >
                  {nasheed.lyrics}
                </p>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>{formatDate(nasheed.updatedAt)}</span>
                </div>
              </div>
            );
          })
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