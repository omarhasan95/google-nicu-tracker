import React from 'react';
import { Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - RIMS NICU Tracker",
  description: "Read the Terms of Service for using NICU Tracker, including our critical medical disclaimer, user responsibilities, and data ownership agreements.",
};

export default function Terms() {
  return (
    <div className="bg-[#fafbfb] py-16 md:py-24 animate-fade-in flex-grow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 md:p-12 border border-[#e2ecec] shadow-sm">
        
        {/* Title */}
        <div className="pb-6 border-b border-[#e2ecec] mb-8 text-left">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#2a3b3c]">Terms of Service</h1>
          <p className="text-xs text-[#5f7475]">Last Updated: May 21, 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-[#5f7475] leading-relaxed text-left">
          <p>
            Welcome to <strong>NICU Tracker</strong>. Please read these Terms of Service (“Terms”) carefully before using our website and application.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">1. Acceptance of Terms</h3>
          <p>
            By creating an account, logging data, or browsing the website, you agree to comply with and be bound by these Terms. If you do not agree, you may not use our services.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">2. MEDICAL DISCLAIMER & LIMITATION OF LIABILITY</h3>
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-xs text-red-950 font-medium space-y-2">
            <p className="uppercase font-bold tracking-wider text-red-700">CRITICAL HEALTH NOTICE:</p>
            <p>
              NICU Tracker is an organization journal, note-keeping, and communication companion.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>It does <strong>NOT</strong> provide medical advice, diagnosis, clinical alerts, or treatment recommendations.</li>
              <li>It does <strong>NOT</strong> replace the professional judgment, shift rounds, or clinical care plan of your baby’s certified hospital medical team.</li>
              <li>Always consult your neonatologists, pediatricians, and nurses regarding health questions, clinical readings, or vital signs.</li>
            </ul>
            <p>
              WE SPECIFICALLY DISCLAIM ALL LIABILITY FOR CLINICAL OUTCOMES, OR FOR ANY ERRORS, INACCURACIES, OR DELETIONS OF USER-LOGGED HEALTH INFORMATION. YOU AGREE THAT YOU USE THIS SERVICE AT YOUR OWN RISK.
            </p>
          </div>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">3. User Responsibilities & Account Security</h3>
          <p>
            You are responsible for safeguarding your login credentials (email and password). You agree not to provide false information or misrepresent profiles. We reserve the right to suspend accounts displaying suspicious activity or bot behavior.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">4. Data Ownership & Export</h3>
          <p>
            You own all information, notes, and log profiles you record. We provide a single-click CSV export utility in the user dashboard. You may download your records at any time.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">5. Service Availability</h3>
          <p>
            While we strive for 100% database availability, our services are provided on an "as-is" and "as-available" basis. We are not liable for transient network disruptions, hosting downtime, or data delays.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">6. Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the service operators reside, without regard to conflict of law provisions.
          </p>
        </div>

        {/* Disclaimer Repeat */}
        <div className="mt-12 pt-6 border-t border-[#e2ecec] text-xs text-[#82a596] italic leading-relaxed text-left flex gap-2 items-start">
          <Heart className="w-4 h-4 text-[#4a7a7c] shrink-0 fill-current mt-0.5" />
          <span>
            Reminder: For clinical questions or medical updates, please verify with your baby's neonatologist or pediatric staff.
          </span>
        </div>

      </div>
    </div>
  );
}
