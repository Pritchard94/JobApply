"use client";

import { create } from "zustand";
import type { Profile } from "@job-auto-apply/shared";

interface UserState {
  profile: Profile | null;
  session: { access_token: string } | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: { access_token: string } | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  session: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ profile: null, session: null, isLoading: false }),
}));
