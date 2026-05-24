'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActiveRoute = (href: string) => {
    if (!pathname) return false;
    return pathname.replace(/\/$/, '') === href.replace(/\/$/, '');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fafbfb]/90 backdrop-blur-md border-b border-[#e2ecec]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group active-press">
          <div className="w-9 h-9 rounded-full bg-[#f0f5f5] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
            <Heart className="w-5 h-5 text-[#4a7a7c] fill-current" />
          </div>
          <span className="font-heading font-bold text-lg text-[#2a3b3c] tracking-tight group-hover:text-[#4a7a7c] transition-colors duration-300">
            RIMS NICU Tracker
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-heading font-medium text-sm transition-all duration-300 relative py-1 ${
                  active ? 'text-[#4a7a7c]' : 'text-[#5f7475] hover:text-[#4a7a7c]'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4a7a7c] rounded-full animate-zoom-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="btn btn-secondary py-2 px-4 text-sm font-semibold flex items-center gap-2 bg-[#f0f5f5] hover:bg-[#e2ecec] hover:shadow-sm text-[#4a7a7c] rounded-full active-press transition-all duration-350"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="btn btn-outline py-2 px-4 text-sm font-semibold text-[#5f7475] hover:text-[#2a3b3c] flex items-center gap-2 border border-[#e2ecec] hover:bg-[#fafbfb] rounded-full active-press transition-all duration-350"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-heading font-semibold text-[#5f7475] hover:text-[#4a7a7c] active-press transition-all duration-200"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="btn btn-primary py-2 px-4 text-sm font-semibold text-white bg-[#4a7a7c] hover:bg-[#3c6365] hover:shadow-md rounded-full shadow-sm active-press transition-all duration-350"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[#2a3b3c] hover:text-[#4a7a7c] active-press transition-all duration-300"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 rotate-90 transition-transform duration-300" />
          ) : (
            <Menu className="w-6 h-6 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#e2ecec] bg-white px-4 pt-4 pb-6 space-y-4 shadow-lg animate-slide-down">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`font-heading font-semibold text-base py-1 transition-all duration-300 ${
                    active ? 'text-[#4a7a7c] border-l-2 border-[#4a7a7c] pl-2' : 'text-[#5f7475] hover:pl-1'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#e2ecec] flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#f0f5f5] text-[#4a7a7c] font-heading font-semibold text-sm flex items-center justify-center gap-2 active-press transition-all duration-300"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 rounded-full border border-[#e2ecec] text-[#5f7475] font-heading font-semibold text-sm flex items-center justify-center gap-2 active-press transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-[#e2ecec] text-[#5f7475] font-heading font-semibold text-sm active-press transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#4a7a7c] text-white font-heading font-semibold text-sm shadow-sm active-press transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
