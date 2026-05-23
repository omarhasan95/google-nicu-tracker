'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Baby, 
  LineChart, 
  MessageSquare, 
  ShieldCheck, 
  Download, 
  Share2, 
  Heart,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Features() {
  const featureList = [
    {
      icon: <ClipboardList className="w-6 h-6 text-[#4a7a7c]" />,
      title: "Daily Care Journaling",
      description: "Log shift updates, nursing notes, diaper counts, medications, and general mood. Keeping notes in one place helps identify trends over time.",
      points: [
        "Record nurse shift summaries",
        "Track diaper counts (wet/dirty)",
        "Document special treatments or therapies",
        "Add photos or private memories"
      ]
    },
    {
      icon: <Baby className="w-6 h-6 text-sage-500" />,
      title: "Feeding & Lactation Logs",
      description: "NICU feeding schedules are precise. Track the method (NG tube, bottle, breast), fortified mixtures, donor milk additions, and parent pumping volumes.",
      points: [
        "Log feeding volumes in milliliters (ml)",
        "Differentiate tube, bottle, and breast sessions",
        "Pumping logs with volumes and storage bin notes",
        "Track fortification calories (e.g. 22cal, 24cal)"
      ]
    },
    {
      icon: <LineChart className="w-6 h-6 text-peach-500" />,
      title: "Weight Progression Charts",
      description: "Every gram counts in the NICU. Save daily weights from the night shifts, chart the growth curve, and track gains toward discharge milestones.",
      points: [
        "Input weight in grams (g)",
        "Clear progress indicators compared to birth weight",
        "Identify daily and weekly gain metrics",
        "Weight trend charts integrated on the dashboard"
      ]
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-amber-500" />,
      title: "Care Team Rounds Q&A",
      description: "Medical rounds happen fast. Jot down concerns, queries, or clarification items to review with neonatologists and pediatricians during morning shift changes.",
      points: [
        "Pre-save questions in between team rounds",
        "Mark questions as answered during consultations",
        "Organize queries by category (respiratory, feeding, etc.)",
        "Easy copy/paste list for sharing with family"
      ]
    }
  ];

  return (
    <div className="bg-[#fafbfb] py-16 md:py-24 animate-fade-in flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e2ecec] text-[#3c6365] mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            Designed For Empathy & Detail
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#2a3b3c] tracking-tight">
            Features that help you breathe easier
          </h1>
          <p className="text-lg text-[#5f7475] leading-relaxed">
            The NICU can feel overwhelming. We designed NICU Tracker to give you a sense of calm, providing organized inputs for all the critical data.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {featureList.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-8 border border-[#e2ecec] shadow-sm hover:shadow-md transition-all flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0f5f5] flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="font-heading font-bold text-xl text-[#2a3b3c]">{feat.title}</h3>
              </div>
              <p className="text-sm text-[#5f7475] leading-relaxed">{feat.description}</p>
              
              <div className="border-t border-[#e2ecec] pt-4 mt-auto">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5f7475]">
                  {feat.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Features Grid */}
        <div className="border-t border-[#e2ecec] pt-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-2xl text-[#2a3b3c]">Additional Toolkits Built-In</h2>
            <p className="text-sm text-[#5f7475] mt-1">Utility configurations to streamline documentation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white rounded-2xl border border-[#e2ecec] flex flex-col gap-3">
              <Download className="w-6 h-6 text-[#4a7a7c]" />
              <h4 className="font-heading font-bold text-base text-[#2a3b3c]">One-Click CSV Export</h4>
              <p className="text-xs text-[#5f7475] leading-relaxed">
                Download a clean comma-separated values (CSV) sheet of all your baby's logs. Bring it to outpatient pediatrician checkups or save for personal archives.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#e2ecec] flex flex-col gap-3">
              <Share2 className="w-6 h-6 text-sage-500" />
              <h4 className="font-heading font-bold text-base text-[#2a3b3c]">Family Sharing (Ready)</h4>
              <p className="text-xs text-[#5f7475] leading-relaxed">
                Log in securely using shared accounts across multiple mobile devices so partners, spouses, and caregivers stay in sync with daily reports.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#e2ecec] flex flex-col gap-3">
              <ShieldCheck className="w-6 h-6 text-peach-500" />
              <h4 className="font-heading font-bold text-base text-[#2a3b3c]">Account Isolation</h4>
              <p className="text-xs text-[#5f7475] leading-relaxed">
                Rigorous security rules ensure your logged data is never shared. Database security layers verify authorization credentials for every single read and write.
              </p>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="mt-20 text-center bg-gradient-to-r from-[#e2ecec] to-[#fafbfb] rounded-3xl p-8 border border-[#e2ecec]">
          <h3 className="font-heading font-bold text-xl text-[#2a3b3c] mb-2">Ready to take control of your record-keeping?</h3>
          <p className="text-sm text-[#5f7475] mb-6 max-w-xl mx-auto">
            Get started on your laptop or mobile phone. Keep NICU Tracker loaded on your home screen for easy logging in the hospital room.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/signup" 
              className="px-6 py-2.5 rounded-full font-semibold text-white bg-[#4a7a7c] hover:bg-[#3c6365] transition-all text-sm shadow-sm"
            >
              Sign Up Free
            </Link>
            <Link 
              href="/about" 
              className="px-6 py-2.5 rounded-full font-semibold text-[#4a7a7c] bg-white border border-[#c6d9d9] hover:bg-[#f2f7f7] transition-all text-sm"
            >
              About the Mission
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
