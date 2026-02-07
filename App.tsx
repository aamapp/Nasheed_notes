import React, { useState, useEffect, useCallback } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { EditorScreen } from './screens/EditorScreen';
import { ReaderScreen } from './screens/ReaderScreen';
import { Nasheed, User, ViewState } from './types';
import { authService, dataService, supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.AUTH);
  const [nasheeds, setNasheeds] = useState<Nasheed[]>([]);
  const [activeNasheed, setActiveNasheed] = useState<Nasheed | null>(null);
  const [loading, setLoading] = useState(true);

  // Optimized Data Loading
  const loadNasheeds = useCallback(async (userId: string) => {
    try {
      // Pass userId explicitly to ensure we query for the correct user immediately
      const data = await dataService.getNasheeds(); 
      setNasheeds(data);
    } catch (error) {
      console.error("Failed to load nasheeds", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        // 1. Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const currentUser = { id: session.user.id, email: session.user.email || '' };
          setUser(currentUser);
          setView(ViewState.HOME);
          await loadNasheeds(currentUser.id);
        } else if (mounted) {
           setView(ViewState.AUTH);
        }
      } catch (error) {
        console.error("Session init error", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = { id: session.user.id, email: session.user.email || '' };
        setUser(newUser);
        setView(ViewState.HOME);
        await loadNasheeds(newUser.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNasheeds([]);
        setActiveNasheed(null);
        setView(ViewState.AUTH);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadNasheeds]);

  const handleLogin = (loggedInUser: User) => {
    // Optimistic update
    setUser(loggedInUser);
    setView(ViewState.HOME);
    loadNasheeds(loggedInUser.id);
  };

  const handleLogout = async () => {
    await authService.signOut();
    // State cleared by subscription
  };

  const handleSaveNasheed = async (nasheed: Nasheed) => {
    // Optimistic UI update for immediate feedback
    const isNew = !nasheeds.find(n => n.id === nasheed.id);
    setNasheeds(prev => {
      if (isNew) return [nasheed, ...prev];
      return prev.map(n => n.id === nasheed.id ? nasheed : n);
    });
    
    setView(ViewState.HOME); // Go back immediately

    try {
      await dataService.saveNasheed(nasheed);
      // Background re-fetch to ensure sync
      if (user) loadNasheeds(user.id);
    } catch (e) {
      console.error("Save failed", e);
      alert("সংরক্ষণ করা যায়নি, ইন্টারনেট সংযোগ চেক করুন");
    }
  };

  const handleDeleteNasheed = async (id: string) => {
    // Optimistic UI update
    setNasheeds(prev => prev.filter(n => n.id !== id));
    setActiveNasheed(null);
    setView(ViewState.HOME);

    try {
      await dataService.deleteNasheed(id);
    } catch (e) {
      console.error("Delete failed", e);
      alert("মুছে ফেলা যায়নি, আবার চেষ্টা করুন");
      // Revert if needed (omitted for simplicity)
      if (user) loadNasheeds(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // View Routing
  if (!user || view === ViewState.AUTH) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (view === ViewState.EDITOR) {
    return (
      <EditorScreen
        userId={user.id}
        initialData={activeNasheed}
        onSave={handleSaveNasheed}
        onCancel={() => {
          if (activeNasheed) setView(ViewState.READER);
          else setView(ViewState.HOME);
        }}
        onDelete={activeNasheed ? handleDeleteNasheed : undefined}
      />
    );
  }

  if (view === ViewState.READER && activeNasheed) {
    return (
      <ReaderScreen
        nasheed={activeNasheed}
        onBack={() => {
          setActiveNasheed(null);
          setView(ViewState.HOME);
        }}
        onEdit={() => setView(ViewState.EDITOR)}
      />
    );
  }

  return (
    <HomeScreen
      user={user}
      nasheeds={nasheeds}
      onCreate={() => {
        setActiveNasheed(null);
        setView(ViewState.EDITOR);
      }}
      onSelect={(nasheed) => {
        setActiveNasheed(nasheed);
        setView(ViewState.READER);
      }}
      onLogout={handleLogout}
    />
  );
};

export default App;