"use client";
import { UIProvider } from '@yamada-ui/react';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Provider } from 'react-redux';
import store from "../hooks/reportStore";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <UIProvider>
            <Header />
            {children}
            <Footer />
          </UIProvider>
        </Provider>
      </body>
    </html>
  );
}

/*"use client";
import { UIProvider } from '@yamada-ui/react';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Provider } from 'react-redux';
import useAuth from "@/functions/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logout } from '@/functions/supabaseClient';
import store from "../hooks/reportStore";
import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const router = useRouter();
  const { profile } = useAuth();
  // 認証チェックが完了したかどうかを追跡する状態
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // ユーザー認証情報の変更を監視する変数
    let authCheckTimer: NodeJS.Timeout;
    
    // 現在のパスを取得
    const currentPath = window.location.pathname;
    // 認証不要のパス（auth関連のページ）
    const authExemptPaths = [
      '/auth/login',
      //'/auth/signup',
      '/auth/reset-pass',
      '/auth/reset-pass-request',
      '/'
    ];
    
    // 認証が不要なパスかどうかをチェック
    const isAuthExemptPath = authExemptPaths.some(path => currentPath === path);
    
    // 認証状態が変わる可能性がある場合の処理（認証不要ページでは実行しない）
    if (!authChecked && !isAuthExemptPath) {
      // 適切な遅延時間を設定（例：3秒）
      authCheckTimer = setTimeout(() => {
        // 指定した時間が経過したら、認証チェックを完了とみなす
        setAuthChecked(true);
        
        // この時点でもprofileがなければログインページへリダイレクト
        if (!profile) {
          Logout().then((data)=>{
            console.log("Logout")
            if(data.success){
              router.push("/auth/login");
            }else{
              console.error("Logout Error");
              router.push("/auth/login");
            }
          })
          router.push("/auth/login");
        }
      }, 5000); // 認証データが読み込まれるのに十分な時間
    } else if (!authChecked && isAuthExemptPath) {
      // 認証不要ページでは、チェックを完了したとマークするだけ
      setAuthChecked(true);
    }
    
    // コンポーネントのクリーンアップ
    return () => {
      if (authCheckTimer) {
        clearTimeout(authCheckTimer);
      }
    };
  }, [authChecked, profile, router]);
  
    return (
      <html lang="en">
        <body>
          <Provider store={store}>
            <UIProvider>
              <Header />
              {children}
              <Footer />
            </UIProvider>
          </Provider>
        </body>
      </html>
    );
  }
*/
