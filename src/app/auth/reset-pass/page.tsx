"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../functions/supabaseClient";

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // パスワード検証用の state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    digit: false,
    symbol: false,
    match: false
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  const router = useRouter();
  
  // パスワードの検証
  useEffect(() => {
    if (newPassword) {
      const validation = {
        length: newPassword.length >= 8,
        lowercase: /[a-z]/.test(newPassword),
        uppercase: /[A-Z]/.test(newPassword),
        digit: /[0-9]/.test(newPassword),
        symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
        match: newPassword === confirmPassword && newPassword !== ""
      };
      
      setPasswordValidation(validation);
      setIsPasswordValid(
        validation.length && 
        validation.lowercase && 
        validation.uppercase && 
        validation.digit && 
        validation.symbol && 
        validation.match
      );
    } else {
      setPasswordValidation({
        length: false,
        lowercase: false,
        uppercase: false,
        digit: false,
        symbol: false,
        match: false
      });
      setIsPasswordValid(false);
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // パスワード検証に失敗した場合、送信しない
    if (!isPasswordValid) {
      setErrorMessage("パスワードが要件を満たしていないか、確認用パスワードと一致していません。");
      return;
    }
    
    setErrorMessage("");
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("パスワードが更新されました。ログインしてください。");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#f8f8f8] border border-black rounded-3xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-8 text-[#212121]">新しいパスワードの設定</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm text-[#757575]">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                placeholder="Password123!"
                className={`w-full px-4 py-3 rounded-md border ${
                  newPassword && !isPasswordValid ? 'border-red-500' : 'border-[#bdbdbd]'
                } focus:outline-none focus:ring-2 focus:ring-[#424242]`}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#757575]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* パスワード要件チェックリスト */}
            <div className="mt-2 text-sm">
              <p className="font-medium mb-1">パスワード要件:</p>
              <ul className="space-y-1">
                <li className="flex items-center">
                  {passwordValidation.length ? 
                    <Check size={16} className="text-green-500 mr-1" /> : 
                    <X size={16} className="text-red-500 mr-1" />
                  }
                  8文字以上
                </li>
                <li className="flex items-center">
                  {passwordValidation.lowercase ? 
                    <Check size={16} className="text-green-500 mr-1" /> : 
                    <X size={16} className="text-red-500 mr-1" />
                  }
                  小文字を含む (a-z)
                </li>
                <li className="flex items-center">
                  {passwordValidation.uppercase ? 
                    <Check size={16} className="text-green-500 mr-1" /> : 
                    <X size={16} className="text-red-500 mr-1" />
                  }
                  大文字を含む (A-Z)
                </li>
                <li className="flex items-center">
                  {passwordValidation.digit ? 
                    <Check size={16} className="text-green-500 mr-1" /> : 
                    <X size={16} className="text-red-500 mr-1" />
                  }
                  数字を含む (0-9)
                </li>
                <li className="flex items-center">
                  {passwordValidation.symbol ? 
                    <Check size={16} className="text-green-500 mr-1" /> : 
                    <X size={16} className="text-red-500 mr-1" />
                  }
                  記号を含む (!@#$%^&*等)
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm text-[#757575]">
              パスワードの確認
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="もう一度パスワードを入力"
                className={`w-full px-4 py-3 rounded-md border ${
                  confirmPassword && !passwordValidation.match ? 'border-red-500' : 'border-[#bdbdbd]'
                } focus:outline-none focus:ring-2 focus:ring-[#424242]`}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#757575]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* パスワード一致チェック */}
            {confirmPassword && (
              <div className="mt-1 flex items-center">
                {passwordValidation.match ? 
                  <Check size={16} className="text-green-500 mr-1" /> : 
                  <X size={16} className="text-red-500 mr-1" />
                }
                <span className={passwordValidation.match ? 'text-green-500' : 'text-red-500'}>
                  {passwordValidation.match ? 'パスワードが一致しています' : 'パスワードが一致していません'}
                </span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!isPasswordValid || isSubmitting}
            className={`w-full py-4 px-4 text-center rounded-md mt-6 font-medium transition-colors ${
              isPasswordValid && !isSubmitting
                ? 'bg-[#212121] text-white hover:bg-[#424242]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '処理中...' : 'パスワードを更新する'}
          </button>
          {errorMessage && <p className="mt-4 text-center text-red-500">{errorMessage}</p>}
          {successMessage && <p className="mt-4 text-center text-green-500">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}
