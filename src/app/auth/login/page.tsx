"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Login } from "../../../functions/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const result = await Login(email, password);
      if (result && result.success) {
        await fetch("/api/sync-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: result.data?.session }),
        });
        router.push("/dashboard");
      } else {
        setErrorMessage("ログインに失敗しました");
      }
    } catch (error) {
      setErrorMessage("ログインに失敗しました");
    }
  };

  return (
    <div className="wrapper ">
      <div className="container  border border-black rounded-3xl shadow-md p-5 sm:p-8 w-full max-w-full md:max-w-md mx-auto bg-[#fff]/60">  
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(e);
          }}
        >
          <div className="space-y-4 ">
            <label htmlFor="email" className="block text-2xl ">
              Emailアドレス
            </label>
            <input
              id="email"
              type="email"
              placeholder="abc@xyz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[70%] px-4 py-3 rounded-md border border-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-[#424242] text-3xl bg-[#fff]"
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="password" className="block text-2xl ">
              個人パスワード
            </label>
            <div className="relative ">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-[70%] px-4 py-3 rounded-md border border-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-[#424242] text-3xl bg-[#fff] "
              />
              <button
                type="button"
                className="absolute right-[20%] top-1/2 transform -translate-y-1/2 text-[#757575]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-[70%] bg-[#212121] text-white py-3 sm:py-4 px-4 text-center rounded-md mt-6 font-medium hover:bg-[#424242] transition-colors text-3xl "
          >
            ログイン
          </button>
          <p className="text-base text-center mt-4 bg-[#fff]/10 ">
            アカウントがない方は{" "}
            <a href="/auth/signup" className="text-blue-500 underline ">
              こちら
            </a>
          </p>
          {errorMessage && (
            <p className="mt-4 text-center text-red-500">{errorMessage}</p>
          )}
        </form>
      </div>

      {/* バブル数を15個に増やす */}
      <ul className="bg-bubbles">
        {Array.from({ length: 15 }).map((_, i) => (
          <li key={i} style={{ "--i": i + 1 } as React.CSSProperties}></li>
        ))}
      </ul>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300");

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-weight: 300;
        }

        /* 画面全体に青系グラデーション背景 */
        .wrapper {
          background: linear-gradient(to bottom right, #2980b9, #6dd5fa);
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ログインボックス（container）のスタイルは、サンプルのデザインに準拠 */
        .container {
          width: 100%;
          max-width: 600px;
          padding: 80px 0;
          background: [#f8f8f8];
          border: 1px solid #000;
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          z-index: 2;
          margin: 0 1rem;
        }

        /* バブルのアニメーション */
        .bg-bubbles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          overflow: hidden;
        }
        .bg-bubbles li {
          position: absolute;
          list-style: none;
          display: block;
          width: 40px;
          height: 40px;
          background-color: rgba(255, 255, 255, 0.15);
          bottom: -160px;
          animation: square 25s infinite;
          animation-fill-mode: both;
          transition-timing-function: linear;
        }
        .bg-bubbles li:nth-child(1) {
          left: 10%;
          animation-delay: 0s;
        }
        .bg-bubbles li:nth-child(2) {
          left: 20%;
          width: 80px;
          height: 80px;
          animation-delay: -2s;
          animation-duration: 17s;
        }
        .bg-bubbles li:nth-child(3) {
          left: 25%;
          animation-delay: -4s;
        }
        .bg-bubbles li:nth-child(4) {
          left: 40%;
          width: 60px;
          height: 60px;
          animation-duration:22s;
          background-color: rgba(255, 255, 255, 0.25);
        }
        .bg-bubbles li:nth-child(5) {
          left: 70%;
        }
        .bg-bubbles li:nth-child(6) {
          left: 80%;
          width: 120px;
          height: 120px;
          animation-delay: -3s;
          background-color: rgba(255, 255, 255, 0.2);
        }
        .bg-bubbles li:nth-child(7) {
          left: 32%;
          width: 160px;
          height: 160px;
          animation-delay: -7s;
        }
        .bg-bubbles li:nth-child(8) {
          left: 55%;
          width: 20px;
          height: 20px;
          animation-delay: -15s;
          animation-duration: 40s;
        }
        .bg-bubbles li:nth-child(9) {
          left: 25%;
          width: 10px;
          height: 10px;
          animation-delay: -2s;
          animation-duration: 40s;
          background-color: rgba(255, 255, 255, 0.3);
        }
        .bg-bubbles li:nth-child(10) {
          left: 90%;
          width: 60px;
          height: 60px;
          animation-delay: -11s;
        }
        /* 追加したバブル */
        .bg-bubbles li:nth-child(n+11) {
          left: calc(10% * var(--i));
          width: 40px;
          height: 40px;
          animation-delay: calc(-1s * var(--i));
          animation-duration: 25s;
        }

        @keyframes square {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-700px) rotate(600deg);
          }
        }
      `}</style>
    </div>
  );
}