"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user";
import { api } from "@/lib/api";
import type { Profile } from "@job-auto-apply/shared";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setProfile, setSession, setLoading } = useUserStore();

  useEffect(() => {
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSession({ access_token: session.access_token });
        try {
          const profile = await api<Profile>("/settings", {
            token: session.access_token,
          });
          setProfile(profile);
        } catch {
          // Profile might not exist yet
        }
      }
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setSession({ access_token: session.access_token });
        try {
          const profile = await api<Profile>("/settings", {
            token: session.access_token,
          });
          setProfile(profile);
        } catch {
          // Will be created on first sign-in
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        setSession(null);
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [setProfile, setSession, setLoading, router]);

  return <>{children}</>;
}
