import React, { useState } from 'react';
import { Button } from '../components/Button';
import { authService } from '../services/supabaseClient';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isSignUp) {
        result = await authService.signUp(email, password);
      } else {
        result = await authService.signIn(email, password);
      }

      if (result.error) {
        if (result.error.includes("Email not confirmed")) {
           throw new Error("অনুগ্রহ করে আপনার ইমেইল চেক করে কনফার্ম করুন।");
        }
        throw new Error(result.error);
      }
      
      if (result.user) onLogin(result.user);
      
    } catch (err: any) {
      setError(err.message || "একটি ত্রুটি হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isSignUp ? 'অ্যাকাউন্ট খুলুন' : 'স্বাগতম'}
          </h1>
          <p className="text-muted">আপনার নাশিদ কালেকশন ক্লাউডে সংরক্ষণ করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-muted">
              ইমেইল অ্যাড্রেস
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-slate-700 rounded-xl text-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-muted">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-slate-700 rounded-xl text-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'অপেক্ষা করুন...' : (isSignUp ? 'সাইন আপ' : 'লগইন')}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-muted">
            {isSignUp ? 'অ্যাকাউন্ট আছে?' : 'অ্যাকাউন্ট নেই?'} {' '}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              {isSignUp ? 'লগইন করুন' : 'সাইন আপ করুন'}
            </button>
          </p>
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-8">
          Supabase এর সাথে সংযুক্ত • ভার্সন ১.০.০
        </p>
      </div>
    </div>
  );
};