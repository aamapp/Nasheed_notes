import React, { useState, useEffect, useCallback } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { EditorScreen } from './screens/EditorScreen';
import { ReaderScreen } from './screens/ReaderScreen';
import { Nasheed, User, ViewState } from './types';
import { authService, dataService, supabase } from './services/supabaseClient';

const App: React.FC = () => {
  // INSTANT LOAD: Initialize state directly from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const id = localStorage.getItem('lastUserId');
    const email = localStorage.getItem('lastUserEmail');
    if (id && email) return { id, email };
    return null;
  });

  const [view, setView] = useState<ViewState>(() => {
    return localStorage.getItem('lastUserId') ? ViewState.HOME : ViewState.AUTH;
  });

  const [nasheeds, setNasheeds] = useState<Nasheed[]>(() => {
    const id = localStorage.getItem('lastUserId');
    if (id) {
      const cached = localStorage.getItem(`nasheeds_${id}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { return []; }
      }
    }
    return [];
  });

  const [activeNasheed, setActiveNasheed] = useState<Nasheed | null>(null);
  
  // If we have user data from cache, we are not "loading" visually
  const [loading, setLoading] = useState(() => !localStorage.getItem('lastUserId'));

  // Optimized Data Loading
  const loadNasheeds = useCallback(async (userId: string) => {
    try {
      // Fetch fresh data
      const data = await dataService.getNasheeds(userId); 
      
      // Update State
      setNasheeds(data);
      
      // Update Cache
      localStorage.setItem(`nasheeds_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to load nasheeds from server", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const currentUser = { id: session.user.id, email: session.user.email || '' };
          
          // Update State (Confirming the optimistic state)
          setUser(currentUser);
          
          // Persist user info for next cold start
          localStorage.setItem('lastUserId', currentUser.id);
          localStorage.setItem('lastUserEmail', currentUser.email);

          if (view === ViewState.AUTH) {
            setView(ViewState.HOME);
          }
          
          // Background fetch to sync latest data
          await loadNasheeds(currentUser.id);
          
        } else if (mounted) {
           // No valid session found
           if (localStorage.getItem('lastUserId')) {
             // We were optimistically logged in, but session is dead. Logout.
             localStorage.removeItem('lastUserId');
             localStorage.removeItem('lastUserEmail');
             setUser(null);
             setNasheeds([]);
           }
           setView(ViewState.AUTH);
        }
      } catch (error) {
        console.error("Session init error", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = { id: session.user.id, email: session.user.email || '' };
        setUser(newUser);
        setView(ViewState.HOME);
        
        localStorage.setItem('lastUserId', newUser.id);
        localStorage.setItem('lastUserEmail', newUser.email);
        
        await loadNasheeds(newUser.id);
      } else if (event === 'SIGNED_OUT') {
        const currentUserId = user?.id || localStorage.getItem('lastUserId');
        if (currentUserId) {
          localStorage.removeItem(`nasheeds_${currentUserId}`);
        }
        localStorage.removeItem('lastUserId');
        localStorage.removeItem('lastUserEmail');
        
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
  }, [loadNasheeds, user?.id, view]);

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('lastUserId', loggedInUser.id);
    localStorage.setItem('lastUserEmail', loggedInUser.email);
    setUser(loggedInUser);
    setView(ViewState.HOME);
    loadNasheeds(loggedInUser.id);
  };

  const handleLogout = async () => {
    const id = user?.id || localStorage.getItem('lastUserId');
    if (id) {
        localStorage.removeItem(`nasheeds_${id}`);
        localStorage.removeItem('lastUserId');
        localStorage.removeItem('lastUserEmail');
    }
    await authService.signOut();
    setUser(null);
    setNasheeds([]);
    setActiveNasheed(null);
    setView(ViewState.AUTH);
  };

  const handleSaveNasheed = async (nasheed: Nasheed) => {
    const isNew = !nasheeds.find(n => n.id === nasheed.id);
    const updatedList = isNew 
      ? [nasheed, ...nasheeds] 
      : nasheeds.map(n => n.id === nasheed.id ? nasheed : n);
    
    setNasheeds(updatedList);
    if (user) localStorage.setItem(`nasheeds_${user.id}`, JSON.stringify(updatedList));

    setView(ViewState.HOME);

    try {
      await dataService.saveNasheed(nasheed);
      if (user) loadNasheeds(user.id);
    } catch (e) {
      console.error("Save failed", e);
      alert("সংরক্ষণ করা যায়নি, ইন্টারনেট সংযোগ চেক করুন");
    }
  };

  const handleDeleteNasheed = async (id: string) => {
    const updatedList = nasheeds.filter(n => n.id !== id);
    setNasheeds(updatedList);
    if (user) localStorage.setItem(`nasheeds_${user.id}`, JSON.stringify(updatedList));

    setActiveNasheed(null);
    setView(ViewState.HOME);

    try {
      await dataService.deleteNasheed(id);
    } catch (e) {
      console.error("Delete failed", e);
      alert("মুছে ফেলা যায়নি, আবার চেষ্টা করুন");
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
      onEdit={(nasheed) => {
        setActiveNasheed(nasheed);
        setView(ViewState.EDITOR);
      }}
      onDelete={handleDeleteNasheed}
      onLogout={handleLogout}
    />
  );
};

export default App;