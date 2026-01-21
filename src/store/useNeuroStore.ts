/**
 * Global Neuro / Cognitive Training store (Zustand).
 * Holds profile, settings, library; syncs with Supabase where applicable.
 * ADHD mode: when neuro_type === 'ADHD', use reduced UI / hide nonessential elements.
 */

import { create } from 'zustand';
import type { Profile, Library, UserSettings } from '@/types';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface NeuroState {
  profile: Profile | null;
  userSettings: UserSettings | null;
  library: Library[];
  focusMode: boolean;
  isLoading: boolean;
  error: string | null;
  /** Set in fetchUserData; used by updateXP/setWPM when persisting. */
  _userId: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface NeuroActions {
  /** Load profile, user_settings, and library for the given user from Supabase. */
  fetchUserData: (userId: string) => Promise<void>;
  /** Add to current XP and persist to Supabase (uses profile.id). */
  updateXP: (amount: number) => Promise<void>;
  /** Set WPM and persist to Supabase (upsert user_settings). */
  setWPM: (speed: number) => Promise<void>;
  /** Add a new library item to Supabase. */
  addLibraryItem: (title: string, content: string) => Promise<void>;
  /** Toggle focus mode (hides nonessential UI). Session-only, not persisted. */
  setFocusMode: (active: boolean) => void;
  /** True when profile.neuro_type === 'ADHD'. Use to reduce/hide UI. */
  getIsAdhdMode: () => boolean;
  /** True when focusMode or ADHD: use to hide nav, extras, etc. */
  getShouldReduceUi: () => boolean;
  setError: (err: string | null) => void;
  clearError: () => void;
  /** Reset entire store (e.g. on logout). */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Defaults & factory
// ---------------------------------------------------------------------------

const initialState: NeuroState = {
  profile: null,
  userSettings: null,
  library: [],
  focusMode: false,
  isLoading: false,
  error: null,
  _userId: null,
};

export const useNeuroStore = create<NeuroState & NeuroActions>((set, get) => ({
  ...initialState,

  fetchUserData: async (userId: string) => {
    // Ensure userId is explicitly a string
    const userIdString = String(userId);
    set({ isLoading: true, error: null, _userId: userIdString });
    const supabase = createClient();

    try {
      const [profileRes, settingsRes, libraryRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userIdString).maybeSingle(),
        supabase.from('user_settings').select('*').eq('user_id', userIdString).maybeSingle(),
        supabase.from('library').select('*').eq('user_id', userIdString),
      ]);

      if (profileRes.error) throw new Error(profileRes.error.message);
      if (settingsRes.error) throw new Error(settingsRes.error.message);
      if (libraryRes.error) throw new Error(libraryRes.error.message);

      // No type casting that could convert to number - use direct assignment
      set({
        profile: profileRes.data as Profile | null ?? null,
        userSettings: settingsRes.data as UserSettings | null ?? null,
        library: (libraryRes.data ?? []) as Library[],
        isLoading: false,
        error: null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'fetchUserData failed';
      set({ isLoading: false, error: msg });
    }
  },

  updateXP: async (amount: number) => {
    const { profile, _userId } = get();
    if (!profile || !_userId) return;
    const next = Math.max(0, (profile.xp_points ?? 0) + amount);

    set({ profile: { ...profile, xp_points: next } });
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ xp_points: next })
      .eq('id', _userId);

    if (error) set({ error: error.message, profile: { ...profile, xp_points: profile.xp_points } });
  },

  setWPM: async (speed: number) => {
    const { userSettings, _userId } = get();
    if (!_userId) return;

    // Ensure user_id is explicitly a string
    const userIdString = String(_userId);
    const clamped = Math.max(1, Math.min(2000, speed));
    const supabase = createClient();

    if (userSettings?.id) {
      const { data, error } = await supabase
        .from('user_settings')
        .update({ wpm_speed: clamped })
        .eq('id', String(userSettings.id))
        .select()
        .single();

      if (!error && data) set({ userSettings: data as UserSettings });
      else if (error) set({ error: error.message });
    } else {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({ user_id: userIdString, wpm_speed: clamped })
        .select()
        .single();

      if (!error && data) set({ userSettings: data as UserSettings });
      else if (error) set({ error: error.message });
    }
  },

  addLibraryItem: async (title: string, content: string) => {
    const { _userId } = get();
    if (!_userId) {
      set({ error: 'User ID not found' });
      return;
    }

    // Ensure user_id is explicitly a string
    const userIdString = String(_userId);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('library')
      .insert({
        user_id: userIdString,
        title: title || 'İsimsiz',
        content_text: content,
      })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
    } else if (data) {
      // Refresh library list
      const { data: libraryData, error: libraryError } = await supabase
        .from('library')
        .select('*')
        .eq('user_id', userIdString);

      if (!libraryError && libraryData) {
        set({ library: libraryData as Library[], error: null });
      }
    }
  },

  setFocusMode: (active: boolean) => set({ focusMode: active }),

  getIsAdhdMode: () => get().profile?.neuro_type === 'ADHD',

  getShouldReduceUi: () => {
    const { focusMode, profile } = get();
    return focusMode || profile?.neuro_type === 'ADHD';
  },

  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
