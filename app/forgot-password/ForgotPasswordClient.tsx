'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Heart, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordClient() {
  const { sendResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await sendResetEmail(email);
      setSuccessMsg(
        "A password recovery email has been sent to your address. Please verify your inbox and spam folder."
      );
      setEmail('');
    } catch (err: any) {
      console.error("Password reset error:", err);
      let message = "Could not send recovery email. Please check the address.";
      if (err.code === 'auth/user-not-found') {
        message = "No account found associated with this email address.";
      } else if (err.code === 'auth/invalid-email') {
        message = "Invalid email format. Please check the spelling.";
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-[#fafbfb] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#e2ecec] shadow-sm p-8 md:p-10 space-y-6">
        
        {/* Header Link */}
        <Link href="/login" className="inline-flex items-center gap-1 text-xs text-[#5f7475] hover:text-[#4a7a7c] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>

        {/* Brand Logo & Description */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#f0f5f5] flex items-center justify-center shadow-sm mx-auto">
            <Heart className="w-6 h-6 text-[#4a7a7c] fill-current" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[#2a3b3c] tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-[#5f7475]">
            Enter your email to receive a secure password recovery link.
          </p>
        </div>

        {/* Alert states */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex gap-2 items-start animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex gap-2 items-start animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5f7475] mb-1.5" htmlFor="reset-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#82a596]" />
              <input
                id="reset-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-4 border-t border-[#e2ecec] text-center text-xs text-[#5f7475]">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-[#4a7a7c] hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
