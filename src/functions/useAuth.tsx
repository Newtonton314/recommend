// useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { Profile } from "../types/Supabase";

const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // 認証を一時的に無効化
    const dummyUser = {
      id: 'dummy-user-id',
      email: 'dummy@example.com',
      role: 'normal'
    } as User;
    setUser(dummyUser);
    setSession({ user: dummyUser } as Session);
    setProfile({
      id: 'dummy-user-id',
      email: 'dummy@example.com',
      display_name: 'Dummy User',
      university_id: 'dummy-university-id',
      role: 'normal',
      create_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    /* 認証処理をコメントアウト
    // 現在のセッションを取得
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // プロフィール情報を取得
        const { data: profileData, error } = await supabase
          .from("profile")
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
    */
  }, []);

  return { session, user, profile };
};

export default useAuth;
