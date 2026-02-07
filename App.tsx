import React, { useState, useEffect } from 'react';
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

  // Initial Session Check & Real-time Auth Listener
  useEffect(() => {
    const checkSession = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setView(ViewState.HOME);
        await loadNasheeds();
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth state changes (Login, Logout, Auto-refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = { id: session.user.id, email: session.user.email || '' };
        setUser(newUser);
        setView(ViewState.HOME);
        await loadNasheeds();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNasheeds([]);
        setView(ViewState.AUTH);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadNasheeds = async () => {
    const data = await dataService.getNasheeds();
    setNasheeds(data); // data is already sorted by backend query
  };

  const handleLogin = (loggedInUser: User) => {
    // State update handled by onAuthStateChange, but we can set it optimistically
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authService.signOut();
    // State update handled by onAuthStateChange
  };

  const handleSaveNasheed = async (nasheed: Nasheed) => {
    try {
      await dataService.saveNasheed(nasheed);
      await loadNasheeds();
      setActiveNasheed(nasheed);
      setView(ViewState.HOME);
    } catch (e) {
      console.error("Save failed", e);
      alert("সংরক্ষণ করা যায়নি, ইন্টারনেট সংযোগ চেক করুন");
    }
  };

  const handleDeleteNasheed = async (id: string) => {
    try {
      await dataService.deleteNasheed(id);
      await loadNasheeds();
      setActiveNasheed(null);
      setView(ViewState.HOME);
    } catch (e) {
      console.error("Delete failed", e);
      alert("মুছে ফেলা যায়নি, আবার চেষ্টা করুন");
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