import { createClient } from '@supabase/supabase-js';
import { Nasheed, User } from '../types';

// Supabase Configuration
const supabaseUrl = 'https://wzzyzijouozniuxxdffv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6enl6aWpvdW96bml1eHhkZmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIxOTUsImV4cCI6MjA4NjA0ODE5NX0._rsJpJ3yefumak0bqSiBlKhvIjJihGRfhK3XVitHNcw';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const authService = {
  // Auth Functions
  signIn: async (email: string, password?: string): Promise<{ user: User | null; error: string | null }> => {
    if (!password) return { user: null, error: "Password required" };
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };
    if (data.user) {
      return { 
        user: { id: data.user.id, email: data.user.email || '' }, 
        error: null 
      };
    }
    return { user: null, error: "লগইন ব্যর্থ হয়েছে" };
  },

  signUp: async (email: string, password?: string): Promise<{ user: User | null; error: string | null }> => {
    if (!password) return { user: null, error: "Password required" };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };
    if (data.user) {
      // Check if email confirmation is required
      if (data.user.identities && data.user.identities.length === 0) {
         return { user: null, error: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে" };
      }
      return { 
        user: { id: data.user.id, email: data.user.email || '' }, 
        error: null 
      };
    }
    return { user: null, error: "সাইন আপ ব্যর্থ হয়েছে" };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return { id: data.user.id, email: data.user.email || '' };
    }
    return null;
  },
};

export const dataService = {
  // Database Functions
  getNasheeds: async (): Promise<Nasheed[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('nasheeds')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching nasheeds:', error);
      return [];
    }

    // Map DB columns to App Types
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      lyrics: item.lyrics,
      createdAt: new Date(item.created_at).getTime(),
      updatedAt: new Date(item.updated_at).getTime(),
      userId: item.user_id,
      isFavorite: item.is_favorite || false
    }));
  },

  saveNasheed: async (nasheed: Nasheed): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    // Map App Types to DB columns
    const dbPayload = {
      id: nasheed.id, // Assuming UUID is generated on client or valid
      title: nasheed.title,
      lyrics: nasheed.lyrics,
      updated_at: new Date().toISOString(),
      created_at: new Date(nasheed.createdAt).toISOString(), // Keep original creation time
      user_id: user.id,
      is_favorite: nasheed.isFavorite
    };

    const { error } = await supabase
      .from('nasheeds')
      .upsert(dbPayload);

    if (error) throw error;
  },

  deleteNasheed: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('nasheeds')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Export a combined service object to maintain compatibility where possible,
// but consumers should prefer the specific services.
export const mockService = {
  signIn: authService.signIn,
  signUp: authService.signUp,
  signOut: authService.signOut,
  getCurrentUser: authService.getCurrentUser, // WARNING: This is now Async!
  getNasheeds: dataService.getNasheeds,
  saveNasheed: dataService.saveNasheed,
  deleteNasheed: dataService.deleteNasheed
};