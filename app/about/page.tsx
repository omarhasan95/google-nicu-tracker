import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ShieldAlert, Award, Star } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us - RIMS NICU Tracker",
  description: "Learn about the mission, values, and developers behind NICU Tracker, a digital companion built with empathy and care to support families during their NICU journey.",
};

export default function About() {
  return (
    <div className="bg-[#fafbfb] py-16 md:py-24 animate-fade-in flex-grow">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e2ecec] text-[#3c6365] mx-auto">
            <Heart className="w-3 h-3 text-[#4a7a7c] fill-current" />
            Our Purpose & Heart
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#2a3b3c] tracking-tight">
            Empowering parents during a fragile time
          </h1>
          <p className="text-lg text-[#5f7475] leading-relaxed">
            NICU Tracker was born out of a real need to simplify data collection, reduce stress, and give parents back a feeling of control in the hospital room.
          </p>
        </div>

        {/* The Stress Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#e2ecec] shadow-sm mb-16 space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-12 h-12 rounded-full bg-peach-100 flex items-center justify-center text-peach-500 shrink-0 shadow-sm mt-1">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-2xl text-[#2a3b3c]">
                The NICU is a place of beautiful victories—and immense stress.
              </h2>
              <p className="text-sm text-[#5f7475] leading-relaxed">
                When a baby is born prematurely or requires specialized pediatric care, families enter an unfamiliar world of monitors, wires, clinical jargon, and daily stats. Shift rounds move quickly, and trying to remember vital weights, feeding trends, and doctor recommendations on scrap paper or messaging threads can feel exhausting.
              </p>
              <p className="text-sm text-[#5f7475] leading-relaxed">
                We believe that parents should have a calm, dedicated, private digital companion. A tool to log daily milestones and medical questions so that when you sit by the incubator, you can focus on holding, bonding, and loving your baby.
              </p>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-white rounded-2xl border border-[#e2ecec] flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
              1
            </div>
            <h4 className="font-heading font-bold text-base text-[#2a3b3c]">Respect for Families</h4>
            <p className="text-xs text-[#5f7475] leading-relaxed">
              We design tools that respect your mental bandwidth. No flashy, distracting layouts—just clean forms, peaceful colors, and quick logging.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#e2ecec] flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600 font-bold text-sm">
              2
            </div>
            <h4 className="font-heading font-bold text-base text-[#2a3b3c]">Absolute Privacy</h4>
            <p className="text-xs text-[#5f7475] leading-relaxed">
              NICU Tracker does not sell data, load third-party ad pixels, or track your movements. Your journal is private to your family.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#e2ecec] flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-peach-100 flex items-center justify-center text-peach-500 font-bold text-sm">
              3
            </div>
            <h4 className="font-heading font-bold text-base text-[#2a3b3c]">Clinical Support</h4>
            <p className="text-xs text-[#5f7475] leading-relaxed">
              Our tool is built to assist doctor-patient communication. By keeping tidy records of weight and questions, rounds run more efficiently.
            </p>
          </div>
        </div>

        {/* Note from Developer */}
        <div className="bg-[#f0f5f5] rounded-3xl p-8 border border-[#e2ecec] flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 rounded-full bg-[#c6d9d9] flex items-center justify-center text-[#4a7a7c] font-heading font-bold text-2xl shrink-0 shadow-inner">
            NT
          </div>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-xs font-semibold text-[#3c6365] uppercase tracking-wider">Developer Promise</span>
            </div>
            <h4 className="font-heading font-bold text-lg text-[#2a3b3c]">Built with empathy and care</h4>
            <p className="text-xs text-[#5f7475] leading-relaxed">
              NICU Tracker was developed after seeing close friends go through the stress of 100-day NICU journeys. We committed to building a clean, production-ready companion that is accessible to all families. We will continue updating features based on parent feedback.
            </p>
            <p className="text-xs font-bold text-[#4a7a7c]">
              — The NICU Tracker Team
            </p>
          </div>
        </div>

        {/* Medical disclaimer repeat */}
        <div className="mt-12 p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-amber-800 leading-relaxed">
          <strong className="block mb-1">Important Health Notice:</strong>
          NICU Tracker is an organization journal only. It does not provide clinical monitoring, alarms, diagnoses, or treatment plans. Do not alter medication dosages or feedings without direct orders from your neonatal care team.
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-[#4a7a7c] hover:bg-[#3c6365] transition-all shadow-sm"
          >
            Start Your Free Journal
          </Link>
        </div>

      </div>
    </div>
  );
}
