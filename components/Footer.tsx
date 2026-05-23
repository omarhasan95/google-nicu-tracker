'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#f0f5f5] border-t border-[#e2ecec] pt-12 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
        
        {/* Brand Column */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-[#4a7a7c] fill-current" />
            </div>
            <span className="font-heading font-bold text-base text-[#2a3b3c] tracking-tight">
              RIMS NICU Tracker
            </span>
          </Link>
          <p className="text-sm text-[#5f7475] max-w-sm">
            Supporting NICU families with calm organization, growth indicators, milestones logging, and private updates.
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="flex flex-col gap-3">
          <h4 className="font-heading font-semibold text-sm text-[#2a3b3c] tracking-wider uppercase">
            Product
          </h4>
          <ul className="space-y-2 text-sm text-[#5f7475]">
            <li><Link href="/" className="hover:text-[#4a7a7c] transition-colors">Home</Link></li>
            <li><Link href="/features" className="hover:text-[#4a7a7c] transition-colors">Features</Link></li>
            <li><Link href="/about" className="hover:text-[#4a7a7c] transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-[#4a7a7c] transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="flex flex-col gap-3">
          <h4 className="font-heading font-semibold text-sm text-[#2a3b3c] tracking-wider uppercase">
            Legal & Trust
          </h4>
          <ul className="space-y-2 text-sm text-[#5f7475]">
            <li><Link href="/privacy" className="hover:text-[#4a7a7c] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[#4a7a7c] transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-[#4a7a7c] transition-colors">HIPAA Compliance Info</Link></li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-[#e2ecec] py-6 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1.5 text-left">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#2a3b3c]">
              Medical Disclaimer
            </span>
            <p className="text-xs leading-relaxed text-[#5f7475]">
              NICU Tracker is an organization, note-keeping, and communication companion. It does NOT provide medical advice, diagnosis, clinical alerts, or treatment recommendations, and does NOT replace the professional judgment, shift rounds, or clinical care plan of your baby’s certified hospital medical team. Always consult your neonatologists, pediatricians, and nurses regarding health questions, clinical readings, or vital signs.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Bottom */}
      <div className="border-t border-[#e2ecec] py-4 bg-[#f0f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#5f7475]">
          &copy; {new Date().getFullYear()} NICU Tracker. All rights reserved. Designed with empathy and care.
        </div>
      </div>
    </footer>
  );
}
