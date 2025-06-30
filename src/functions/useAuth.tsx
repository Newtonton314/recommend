// useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { Profile } from "../types/Supabase";

const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    // 現在のセッションを取得
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // プロフィール情報を取得
        const { data: profileData, error } = await supabase
          .from("profile") // プロフィールを保存しているテーブル名
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error) {
          setProfile(profileData);
        }
      }
    };

    fetchSession();

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // プロフィール情報を取得
        const fetchProfile = async () => {
          const { data: profileData, error } = await supabase
            .from("profile")
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error) {
            setProfile(profileData);
          }
        };

        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, profile };
};

export default useAuth;
