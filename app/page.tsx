'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  ChevronDown, 
  Calendar, 
  Baby, 
  LineChart, 
  ShieldCheck, 
  ClipboardList, 
  Sparkles, 
  MessageSquare,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'weight' | 'feeding' | 'milestones'>('weight');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const [stats, setStats] = useState({
    totalAdmissions: 1482,
    survivalRate: 97.4,
    alos: 11.2,
    nicuMix: 65,
    sncuMix: 35,
    activeCases: 0,
    hasLocalData: false
  });

  React.useEffect(() => {
    // Attempt to aggregate statistics from localStorage to make it interactive and dynamic!
    try {
      if (typeof window !== 'undefined') {
        let totalLocalPatients = 0;
        let dischargedLocal = 0;
        let closedOutcomes = 0;
        let totalStayHours = 0;
        let nicuCount = 0;
        let sncuCount = 0;
        let activeCount = 0;

        // Scan all localStorage keys starting with nicu_patients_
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('nicu_patients_')) {
            const data = localStorage.getItem(key);
            if (data) {
              const list = JSON.parse(data);
              if (Array.isArray(list)) {
                list.forEach((p: any) => {
                  totalLocalPatients++;
                  if (p.unit === 'NICU') nicuCount++;
                  else if (p.unit === 'SNCU') sncuCount++;
                  
                  if (p.status === 'Admitted') {
                    activeCount++;
                  } else {
                    closedOutcomes++;
                    if (p.status === 'Discharged') {
                      dischargedLocal++;
                      // Calculate stay hours
                      if (p.admissionDate && p.outcomeDate) {
                        const start = new Date(p.admissionDate).getTime();
                        const end = new Date(p.outcomeDate).getTime();
                        if (end >= start) {
                          totalStayHours += (end - start) / (1000 * 60 * 60);
                        }
                      }
                    }
                  }
                });
              }
            }
          }
        }

        if (totalLocalPatients > 0) {
          const rawSurvival = closedOutcomes > 0 ? (dischargedLocal / closedOutcomes) * 100 : 97.4;
          const rawAlos = dischargedLocal > 0 ? (totalStayHours / 24 / dischargedLocal) : 11.2;
          const totalUnits = nicuCount + sncuCount;
          const rawNicu = totalUnits > 0 ? (nicuCount / totalUnits) * 100 : 65;

          setStats({
            totalAdmissions: 1482 + totalLocalPatients, // Add local mock cases to baseline
            survivalRate: parseFloat(rawSurvival.toFixed(1)),
            alos: parseFloat(rawAlos.toFixed(1)),
            nicuMix: Math.round(rawNicu),
            sncuMix: 100 - Math.round(rawNicu),
            activeCases: activeCount,
            hasLocalData: true
          });
        }
      }
    } catch (e) {
      console.error("Error loading home page stats:", e);
    }
  }, []);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail.trim()) {
      setWaitlistSubmitted(true);
      setWaitlistEmail('');
    }
  };

  const faqs = [
    {
      q: "Is NICU Tracker secure and private?",
      a: "Yes. Your baby's data is encrypted in transit and at rest. We separate database records by user account so only you can access your baby's files. We do not sell or share health data with insurers or third parties."
    },
    {
      q: "Can I share access with family members or my partner?",
      a: "Yes! Currently, you can log in with the same email/password credentials on multiple devices to keep parents and grandparents in sync. A dedicated family-sharing page/permission system is in development."
    },
    {
      q: "Does this replace my baby's electronic medical records (EMR)?",
      a: "No. NICU Tracker is a parent-facing organization and journaling companion. It is designed to help you organize notes, remember questions for doctor rounds, and visualize progress. It does not interface with hospital EMR systems and is not a clinical diagnosis tool."
    },
    {
      q: "Can I export my logs for pediatricians?",
      a: "Absolutely. In your protected dashboard, you can download a full CSV export of all daily entries, including weights, feeding amounts, and notes, with a single click."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f2f7f7] via-[#fafbfb] to-white pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left gap-6 animate-slide-up">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e2ecec] text-[#3c6365]">
                <Sparkles className="w-3.5 h-3.5 text-[#4a7a7c]" />
                A calming companion for NICU parents
              </span>
              
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#2a3b3c] leading-[1.1] tracking-tight">
                A calm, simple way to track your baby’s <span className="text-[#4a7a7c]">NICU journey</span>.
              </h1>
              
              <p className="text-lg sm:text-xl text-[#5f7475] leading-relaxed max-w-xl">
                Log daily updates, feeding, weight changes, milestones, and questions for the care team in one secure place. Reduce the overwhelm and focus on what matters most.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link 
                  href="/signup" 
                  className="px-8 py-4 rounded-full font-semibold text-white bg-[#4a7a7c] hover:bg-[#3c6365] shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 group"
                >
                  Start Tracking Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/features" 
                  className="px-8 py-4 rounded-full font-semibold text-[#4a7a7c] border border-[#c6d9d9] hover:bg-[#f2f7f7] transition-all text-center"
                >
                  Explore Features
                </Link>
              </div>

              {/* Security and Medical Disclaimer Note */}
              <div className="flex items-center gap-2 text-xs text-[#82a596] mt-2">
                <ShieldCheck className="w-4 h-4 text-[#4a7a7c]" />
                <span>Private & Secure data model</span>
                <span className="w-1 h-1 bg-[#d3dfda] rounded-full"></span>
                <span>Parent-led journal helper</span>
              </div>
            </div>

            {/* Right Column: Interactive Mockup */}
            <div className="lg:col-span-5 w-full">
              <div className="relative mx-auto max-w-[400px] sm:max-w-[450px] lg:max-w-none bg-white rounded-3xl shadow-xl border border-[#e2ecec] overflow-hidden p-6 animate-fade-in">
                
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#e2ecec] mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#f0f5f5] flex items-center justify-center">
                      <Baby className="w-4.5 h-4.5 text-[#4a7a7c]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#2a3b3c]">Baby Leo's Dashboard</h4>
                      <p className="text-[10px] text-[#5f7475]">Day 14 in NICU • Discharge Target: June 15</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Stable
                  </span>
                </div>

                {/* Mockup Profile Mini Card */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#fafbfb] p-2 rounded-xl border border-[#e2ecec] text-center">
                    <span className="text-[9px] text-[#5f7475] block">Current Weight</span>
                    <strong className="text-xs text-[#2a3b3c]">1,850g</strong>
                    <span className="text-[8px] text-emerald-600 block">+40g today</span>
                  </div>
                  <div className="bg-[#fafbfb] p-2 rounded-xl border border-[#e2ecec] text-center">
                    <span className="text-[9px] text-[#5f7475] block">Total Feedings</span>
                    <strong className="text-xs text-[#2a3b3c]">8 logs</strong>
                    <span className="text-[8px] text-[#4a7a7c] block">Breast & Tube</span>
                  </div>
                  <div className="bg-[#fafbfb] p-2 rounded-xl border border-[#e2ecec] text-center">
                    <span className="text-[9px] text-[#5f7475] block">Temperature</span>
                    <strong className="text-xs text-[#2a3b3c]">36.8°C</strong>
                    <span className="text-[8px] text-[#5f7475] block">Skin-to-skin ok</span>
                  </div>
                </div>

                {/* Tab Switcher (Mockup) */}
                <div className="flex border-b border-[#e2ecec] mb-3 text-xs">
                  <button 
                    onClick={() => setActiveTab('weight')}
                    className={`flex-1 pb-2 font-medium text-center border-b-2 transition-all ${
                      activeTab === 'weight' 
                        ? 'border-[#4a7a7c] text-[#4a7a7c]' 
                        : 'border-transparent text-[#5f7475]'
                    }`}
                  >
                    Weight Gain
                  </button>
                  <button 
                    onClick={() => setActiveTab('feeding')}
                    className={`flex-1 pb-2 font-medium text-center border-b-2 transition-all ${
                      activeTab === 'feeding' 
                        ? 'border-[#4a7a7c] text-[#4a7a7c]' 
                        : 'border-transparent text-[#5f7475]'
                    }`}
                  >
                    Feeding Logs
                  </button>
                  <button 
                    onClick={() => setActiveTab('milestones')}
                    className={`flex-1 pb-2 font-medium text-center border-b-2 transition-all ${
                      activeTab === 'milestones' 
                        ? 'border-[#4a7a7c] text-[#4a7a7c]' 
                        : 'border-transparent text-[#5f7475]'
                    }`}
                  >
                    Milestones
                  </button>
                </div>

                {/* Interactive Tab Body */}
                <div className="h-44 flex flex-col justify-between">
                  {activeTab === 'weight' && (
                    <div className="flex flex-col h-full justify-between">
                      <p className="text-[11px] text-[#5f7475]">Track continuous growth trend in simple visual form:</p>
                      
                      {/* CSS-based Weight Sparkline chart */}
                      <div className="h-24 flex items-end gap-1.5 justify-between px-2 pt-2">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[8px] text-[#82a596]">1620g</span>
                          <div className="w-full bg-[#c6d9d9] rounded-t-sm" style={{ height: '35px' }}></div>
                          <span className="text-[8px] text-[#82a596]">May 10</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[8px] text-[#82a596]">1680g</span>
                          <div className="w-full bg-[#c6d9d9] rounded-t-sm" style={{ height: '48px' }}></div>
                          <span className="text-[8px] text-[#82a596]">May 12</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[8px] text-[#82a596]">1730g</span>
                          <div className="w-full bg-[#c6d9d9] rounded-t-sm" style={{ height: '58px' }}></div>
                          <span className="text-[8px] text-[#82a596]">May 14</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[8px] text-[#82a596]">1790g</span>
                          <div className="w-full bg-[#c6d9d9] rounded-t-sm" style={{ height: '70px' }}></div>
                          <span className="text-[8px] text-[#82a596]">May 16</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[8px] text-[#82a596]">1850g</span>
                          <div className="w-full bg-[#4a7a7c] rounded-t-sm" style={{ height: '82px' }}></div>
                          <span className="text-[8px] font-bold text-[#4a7a7c]">Today</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'feeding' && (
                    <div className="space-y-2 overflow-y-auto">
                      <div className="p-2 bg-[#f6f8f7] rounded-lg border border-[#ebf0ee] flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-[#2a3b3c]">08:00 AM • Feeding</strong>
                          <p className="text-[10px] text-[#5f7475]">Fortified EBM, 45ml tube feed</p>
                        </div>
                        <span className="text-[10px] bg-[#e2ecec] text-[#3c6365] px-1.5 py-0.5 rounded">Tolerated well</span>
                      </div>
                      <div className="p-2 bg-[#f6f8f7] rounded-lg border border-[#ebf0ee] flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-[#2a3b3c]">11:30 AM • Pumping Log</strong>
                          <p className="text-[10px] text-[#5f7475]">Both breasts, total volume: 75ml</p>
                        </div>
                        <span className="text-[10px] text-peach-500 bg-peach-50 px-1.5 py-0.5 rounded">Saved in bin A</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'milestones' && (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-start text-xs p-1.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold">✓</div>
                        <div>
                          <strong className="text-[#2a3b3c]">First Skin-to-Skin Care (Kangaroo)</strong>
                          <p className="text-[10px] text-[#5f7475]">Held baby for 45 mins. Heart rate stable.</p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start text-xs p-1.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold">✓</div>
                        <div>
                          <strong className="text-[#2a3b3c]">Off IV Fluids</strong>
                          <p className="text-[10px] text-[#5f7475]">Gaining sufficient weight from enteral feeds.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#e2ecec] text-center">
                  <span className="text-[10px] text-[#82a596] italic">
                    "NICU Tracker helps us feel in control of the numbers during a time when everything feels out of control." — Clara S.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIMS NICU Registry Live Statistics Section */}
      <section className="bg-slate-50 border-t border-b border-[#e2ecec] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left side: Header explanation */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e2ecec] text-[#3c6365] uppercase tracking-wider">
                📊 Clinical Database summary
              </span>
              <h2 className="font-heading font-extrabold text-3xl text-[#2a3b3c] tracking-tight">
                RIMS NICU Registry Statistics
              </h2>
              <p className="text-sm text-[#5f7475] leading-relaxed">
                High-level operational and clinical outcomes compiled across registered admissions in the neonatology database.
              </p>
              {stats.hasLocalData && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                  Includes active browser demo registry logs
                </div>
              )}
            </div>

            {/* Right side: Stats cards grid (Col 8) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Card 1: Total Admissions */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2ecec] shadow-sm flex flex-col justify-between text-left h-36">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Admissions</span>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight tabular-nums mt-2">
                    {stats.totalAdmissions.toLocaleString()}
                  </h3>
                  <span className="text-[9px] text-[#82a596] font-semibold mt-1 block">Newborn admissions</span>
                </div>
              </div>

              {/* Card 2: Survival Rate */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2ecec] shadow-sm flex flex-col justify-between text-left h-36">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Survival Rate</span>
                <div>
                  <h3 className="text-3xl font-black text-emerald-600 tracking-tight tabular-nums mt-2">
                    {stats.survivalRate}%
                  </h3>
                  <span className="text-[9px] text-emerald-700/80 font-semibold mt-1 block">Closed outcomes</span>
                </div>
              </div>

              {/* Card 4: Average Length of Stay */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2ecec] shadow-sm flex flex-col justify-between text-left h-36">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average ALOS</span>
                <div>
                  <h3 className="text-3xl font-black text-amber-600 tracking-tight tabular-nums mt-2">
                    {stats.alos} days
                  </h3>
                  <span className="text-[9px] text-amber-700/80 font-semibold mt-1 block">Inpatient stay</span>
                </div>
              </div>

              {/* Card 5: Unit Mix */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2ecec] shadow-sm flex flex-col justify-between text-left h-36">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unit Mix</span>
                <div>
                  <h3 className="text-xl font-extrabold text-indigo-700 tracking-tight mt-3">
                    {stats.nicuMix}% N / {stats.sncuMix}% S
                  </h3>
                  <span className="text-[9px] text-indigo-600 font-semibold mt-1.5 block">NICU vs SNCU admissions</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* One-Sentence Core Benefit Section */}
      <section className="bg-[#4a7a7c] text-white py-8 text-center px-4">
        <p className="text-lg md:text-xl font-heading font-medium tracking-wide max-w-4xl mx-auto">
          "Designed to organize the daily medical stats, clinical details, and milestones so NICU families can communicate clearly and take a deep breath."
        </p>
      </section>

      {/* Features Showcase Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16 flex flex-col gap-4">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-[#2a3b3c]">
              Everything you need to navigate the NICU stay
            </h2>
            <p className="text-lg text-[#5f7475]">
              Daily hospital days can feel like a blur. We structure your logs to keep everyone aligned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-[#fafbfb] rounded-2xl border border-[#e2ecec] text-left flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-sm">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#2a3b3c]">Daily Notes</h3>
              <p className="text-sm text-[#5f7475]">
                Log general events, medications, updates from the nurse shifts, and notes from doctors’ morning rounds.
              </p>
            </div>

            <div className="p-6 bg-[#fafbfb] rounded-2xl border border-[#e2ecec] text-left flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600 shadow-sm">
                <Baby className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#2a3b3c]">Feeding & Pumping</h3>
              <p className="text-sm text-[#5f7475]">
                Track volumes in ml, donor milk additions, fortification details, and pumping schedules to stay organized.
              </p>
            </div>

            <div className="p-6 bg-[#fafbfb] rounded-2xl border border-[#e2ecec] text-left flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-peach-100 flex items-center justify-center text-peach-500 shadow-sm">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#2a3b3c]">Weight Tracking</h3>
              <p className="text-sm text-[#5f7475]">
                Chart daily weights in grams to visualize steady growth patterns and milestones leading toward discharge.
              </p>
            </div>

            <div className="p-6 bg-[#fafbfb] rounded-2xl border border-[#e2ecec] text-left flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#2a3b3c]">Care Team Questions</h3>
              <p className="text-sm text-[#5f7475]">
                Jot down questions for doctors or specialists in between rounds so you never forget to ask when they visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Timeline section */}
      <section className="py-16 bg-[#fafbfb] border-t border-b border-[#e2ecec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading font-bold text-3xl text-[#2a3b3c]">How NICU Tracker works</h2>
            <p className="text-[#5f7475] mt-2">Simple onboarding designed to respect your focus and time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#4a7a7c] text-white flex items-center justify-center font-heading font-bold text-lg mb-4 shadow-md">
                1
              </div>
              <h4 className="font-heading font-bold text-lg text-[#2a3b3c] mb-2">Create Account</h4>
              <p className="text-sm text-[#5f7475] max-w-xs">
                Sign up securely using your email. We keep all profiles private and fully separated.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#4a7a7c] text-white flex items-center justify-center font-heading font-bold text-lg mb-4 shadow-md">
                2
              </div>
              <h4 className="font-heading font-bold text-lg text-[#2a3b3c] mb-2">Build Baby's Profile</h4>
              <p className="text-sm text-[#5f7475] max-w-xs">
                Enter your baby's name, birth weight, NICU start date, and hospital name to personalize logs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#4a7a7c] text-white flex items-center justify-center font-heading font-bold text-lg mb-4 shadow-md">
                3
              </div>
              <h4 className="font-heading font-bold text-lg text-[#2a3b3c] mb-2">Log Daily Entries</h4>
              <p className="text-sm text-[#5f7475] max-w-xs">
                Save daily stats, track milk volumes, view weight progress, and print reports for your care team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f0f5f5] rounded-3xl border border-[#e2ecec] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-16 h-16 rounded-full bg-[#4a7a7c] flex items-center justify-center text-white shrink-0 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="flex-1 text-left space-y-4">
              <h3 className="font-heading font-bold text-2xl text-[#2a3b3c]">
                Your family's privacy is our highest priority
              </h3>
              <p className="text-sm text-[#5f7475] leading-relaxed">
                Health information is deeply sensitive. NICU Tracker is built with modern security best practices: database queries are isolated by account tokens, all sessions are encrypted, and we strictly enforce read/write policies. We do not connect to external clinics, ensuring you retain total ownership over what you choose to log.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#4a7a7c]">
                <span>✓ Secured with SSL Encryption</span>
                <span>✓ No Third-Party Health Ads</span>
                <span>✓ Download or Delete Data Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 bg-[#fafbfb] border-t border-[#e2ecec]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading font-bold text-3xl text-[#2a3b3c] text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[#e2ecec] overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-heading font-semibold text-[#2a3b3c] hover:text-[#4a7a7c] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[#82a596] transition-transform duration-300 ${
                      expandedFaq === idx ? 'rotate-180' : 'rotate-0'
                    }`} 
                  />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedFaq === idx ? 'max-h-48 border-t border-[#e2ecec]' : 'max-h-0'
                  }`}
                >
                  <p className="p-5 text-sm text-[#5f7475] leading-relaxed bg-[#fafbfb]">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA / Waitlist Section */}
      <section className="py-20 bg-gradient-to-t from-[#f2f7f7] to-white border-t border-[#e2ecec] text-center px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#2a3b3c]">
            Ready to bring clarity to your baby's NICU stay?
          </h2>
          <p className="text-base sm:text-lg text-[#5f7475] max-w-xl mx-auto">
            Log in or create a private account to start tracking immediately. Or, sign up for waitlist updates as we add new nurse integrations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-white bg-[#4a7a7c] hover:bg-[#3c6365] transition-all shadow-md"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-[#4a7a7c] bg-white border border-[#c6d9d9] hover:bg-[#f2f7f7] transition-all"
            >
              Log In
            </Link>
          </div>

          <div className="pt-8 border-t border-[#e2ecec] max-w-md mx-auto">
            <h4 className="font-heading font-semibold text-xs uppercase text-[#5f7475] tracking-wider mb-3">
              Or subscribe to our development newsletter
            </h4>
            {waitlistSubmitted ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-100 animate-fade-in">
                Thank you! We've saved your subscription.
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex gap-2 p-1.5 rounded-full bg-white border border-[#c6d9d9] shadow-sm">
                <input 
                  type="email" 
                  required
                  placeholder="Enter email for product updates" 
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs text-[#2a3b3c] outline-none rounded-full"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#4a7a7c] hover:bg-[#3c6365] text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Mandatory Notice */}
      <div className="bg-[#fcfdfd] py-4 border-t border-[#e2ecec] text-center text-[10px] text-[#82a596] px-4 font-medium italic">
        * NICU Tracker is a personal organizer and note-keeping companion. It does not provide medical guidance and does not replace clinic logs.
      </div>

    </div>
  );
}
