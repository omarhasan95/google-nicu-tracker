'use client';

import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="bg-[#fafbfb] py-16 md:py-24 animate-fade-in flex-grow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 md:p-12 border border-[#e2ecec] shadow-sm">
        
        {/* Title */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#e2ecec] mb-8">
          <div className="w-10 h-10 rounded-full bg-[#f0f5f5] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#4a7a7c]" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#2a3b3c]">Privacy Policy</h1>
            <p className="text-xs text-[#5f7475]">Last Updated: May 21, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-[#5f7475] leading-relaxed text-left">
          <p>
            At <strong>NICU Tracker</strong>, we understand that your baby's health information is deeply personal and sensitive. We are committed to protecting the privacy and security of your records. This Privacy Policy details how we collect, store, isolate, and delete logs in our systems.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">1. HIPAA & Clinical Data Positioning</h3>
          <p>
            NICU Tracker is a personal, parent-led organization journal and communication aid. It is <strong>NOT</strong> an electronic medical records (EMR) system and does not interface with hospital clinical databases. Because we store parent-entered notes on a commercial cloud database structure, this product is designed for individual organizational use. For health systems seeking enterprise clinical trials or integrations, please contact our engineering division regarding dedicated HIPAA-compliant hosting pipelines.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">2. Information We Collect</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Email and passwords managed via Firebase Authentication.</li>
            <li><strong>Baby Profile:</strong> Baby name, birth date, NICU admission date, hospital name, and parent name.</li>
            <li><strong>Daily Logs:</strong> Weights (grams), feeding amounts, medication names, pumping details, rounds questions, and notes.</li>
          </ul>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">3. How Your Data Is Secured & Separated</h3>
          <p>
            All information is secured via TLS encryption in transit and encrypted storage pools at rest. Our database structure uses account separation tokens, meaning every reading and write query is validated directly against your authenticated account UID. Other users cannot access your records under any circumstances.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">4. Your Data Deletion Rights</h3>
          <p>
            You retain full ownership of your records. If you decide to close your account, you can request full erasure of your profile and logs. Contact support at <a href="mailto:support@nicutracker.com" className="text-[#4a7a7c] font-semibold underline">support@nicutracker.com</a> or use the support form to initiate a complete database purge.
          </p>

          <h3 className="font-heading font-bold text-lg text-[#2a3b3c] pt-2">5. Updates to This Policy</h3>
          <p>
            We may update our privacy rules as we launch family-sharing or medical-rounds collaboration modules. We will notify active users via email before launching any updates.
          </p>
        </div>

        {/* Disclaimer Repeat */}
        <div className="mt-12 pt-6 border-t border-[#e2ecec] text-xs text-[#82a596] italic leading-relaxed text-left flex gap-2 items-start">
          <Heart className="w-4 h-4 text-[#4a7a7c] shrink-0 fill-current mt-0.5" />
          <span>
            Disclaimer: NICU Tracker is an organization companion only. It does not replace clinic logs, nurse monitors, or physician rounds. Do not rely on saved charts for medical emergencies.
          </span>
        </div>

      </div>
    </div>
  );
}
