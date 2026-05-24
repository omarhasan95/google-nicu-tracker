'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Heart, KeyRound, Mail, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LoginClient() {
  const { user, loading, signIn, signInWithGoogle, isMock } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If user is already authenticated, redirect to /dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Google login error:", err);
      setErrorMsg("Google Sign-In failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Auth login error:", err);
      // Friendly messages based on Firebase codes
      let message = "Invalid email or password. Please verify and try again.";
      if (err.code === 'auth/user-not-found') {
        message = "No account found with this email. Please sign up first.";
      } else if (err.code === 'auth/wrong-password') {
        message = "Incorrect password. Please verify and try again.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "Too many login attempts. This account has been temporarily locked. Please reset password or try again later.";
      } else if (err.code === 'auth/invalid-credential') {
        message = "Invalid email or password. Please verify and try again.";
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#fafbfb] py-24">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4a7a7c] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#5f7475] font-medium">Checking authorization state...</p>
        </div>
      </div>
    );
  }

  // Render form
  return (
    <div className="flex-grow flex items-center justify-center bg-[#fafbfb] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#e2ecec] shadow-sm p-8 md:p-10 space-y-6">
        
        {/* Header Link */}
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#5f7475] hover:text-[#4a7a7c] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>

        {/* Brand Logo & Greeting */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#f0f5f5] flex items-center justify-center shadow-sm mx-auto">
            <Heart className="w-6 h-6 text-[#4a7a7c] fill-current" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[#2a3b3c] tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs text-[#5f7475]">
            Access your baby's journal and log daily progress notes.
          </p>
        </div>

        {/* Mock Demo Notification */}
        {isMock && (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex gap-2 items-start animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-[#4a7a7c] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#3c6365]">Demo Mode Active (Local Storage)</strong>
              <p className="mt-0.5 text-[#5f7475] leading-relaxed">
                Firebase keys are unconfigured. Any email/password will automatically register or log in securely on your local device storage.
              </p>
            </div>
          </div>
        )}

        {/* Form Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex gap-2 items-start animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5f7475] mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#82a596]" />
              <input
                id="login-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#5f7475]" htmlFor="login-password">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs font-semibold text-[#4a7a7c] hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-[#82a596]" />
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#4a7a7c] hover:bg-[#3c6365] disabled:bg-primary-300 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-1.5">
          <span className="absolute inset-x-0 border-t border-[#e2ecec]"></span>
          <span className="relative bg-white px-3 text-[10px] text-[#82a596] font-bold uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl border border-[#c6d9d9] hover:bg-slate-50 text-[#5f7475] hover:text-[#2a3b3c] font-semibold transition-all text-xs flex items-center justify-center cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          Google Account
        </button>

        {/* Footer links */}
        <div className="pt-4 border-t border-[#e2ecec] text-center text-xs text-[#5f7475]">
          New to NICU Tracker?{" "}
          <Link href="/signup" className="font-bold text-[#4a7a7c] hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
