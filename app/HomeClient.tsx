'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { getPatients } from '../lib/dbService';
import { Patient } from '../types';
import { 
  Baby, 
  ShieldCheck, 
  Activity, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';

// Helper utilities for date calculations
function calculateHoursBetween(startStr: string, endStr: string): number | null {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function formatAgeString(hours: number | null): string {
  if (hours === null || hours < 0) return 'N/A';
  if (hours < 24) return `DOL 1 (${Math.floor(hours)}h)`;
  const days = Math.floor(hours / 24);
  const rem = Math.floor(hours % 24);
  return `DOL ${days + 1} (${days}d ${rem}h)`;
}

export default function HomeClient() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);
  const [mockUnit, setMockUnit] = useState<'NICU 1' | 'NICU 2'>('NICU 1');
  const [selectedMockBed, setSelectedMockBed] = useState<number>(1);

  // Pre-populated default mock list to display if there's no true registry database records.
  const defaultMockList: Patient[] = useMemo(() => [
    // NICU 1 Admitted
    { 
      id: 'm1', name: 'Baby Boy A.', uhid: 'UHID-4029', dob: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 1', bedNumber: 1, 
      status: 'Admitted', diagnosis: 'Pre Term (32wk)', notes: 'Stable', rbsLog: [{ value: 75, timestamp: new Date().toISOString() }], admissionType: 'Inborn' 
    },
    { 
      id: 'm2', name: 'Baby Girl K.', uhid: 'UHID-8920', dob: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 1', bedNumber: 2, 
      status: 'Admitted', diagnosis: 'RDS (Respirator)', notes: 'Observe', rbsLog: [{ value: 62, timestamp: new Date().toISOString() }], admissionType: 'Inborn' 
    },
    { 
      id: 'm3', name: 'Baby Boy S.', uhid: 'UHID-3310', dob: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 1', bedNumber: 4, 
      status: 'Admitted', diagnosis: 'Birth Asphyxia', notes: 'Stable', rbsLog: [{ value: 80, timestamp: new Date().toISOString() }], admissionType: 'Inborn' 
    },
    { 
      id: 'm4', name: 'Baby Boy J.', uhid: 'UHID-1102', dob: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 1', bedNumber: 5, 
      status: 'Admitted', diagnosis: 'Pre Term (34wk)', notes: 'Stable', rbsLog: [{ value: 78, timestamp: new Date().toISOString() }], admissionType: 'Outborn' 
    },
    { 
      id: 'm5', name: 'Baby Girl M.', uhid: 'UHID-9932', dob: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 1', bedNumber: 7, 
      status: 'Admitted', diagnosis: 'SEPSIS', notes: 'Observe', rbsLog: [{ value: 55, timestamp: new Date().toISOString() }], admissionType: 'Outborn' 
    },
    // NICU 2 Admitted
    { 
      id: 'm6', name: 'Baby Boy L.', uhid: 'UHID-7729', dob: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 2', bedNumber: 2, 
      status: 'Admitted', diagnosis: 'Pre Term (33wk)', notes: 'Stable', rbsLog: [{ value: 72, timestamp: new Date().toISOString() }], admissionType: 'Inborn' 
    },
    { 
      id: 'm7', name: 'Baby Girl H.', uhid: 'UHID-5541', dob: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 2', bedNumber: 3, 
      status: 'Admitted', diagnosis: 'Pre Term (33wk)', notes: 'Stable', rbsLog: [{ value: 70, timestamp: new Date().toISOString() }], admissionType: 'Inborn' 
    },
    { 
      id: 'm8', name: 'Baby Boy R.', uhid: 'UHID-2234', dob: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 2', bedNumber: 5, 
      status: 'Admitted', diagnosis: 'RDS (Respirator)', notes: 'Observe', rbsLog: [{ value: 58, timestamp: new Date().toISOString() }], admissionType: 'Outborn' 
    },
    { 
      id: 'm9', name: 'Baby Girl P.', uhid: 'UHID-9018', dob: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 2', bedNumber: 6, 
      status: 'Admitted', diagnosis: 'Pre Term (35wk)', notes: 'Stable', rbsLog: [{ value: 74, timestamp: new Date().toISOString() }], admissionType: 'Inborn' 
    },
    { 
      id: 'm10', name: 'Baby Boy T.', uhid: 'UHID-4428', dob: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), 
      admissionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), unit: 'NICU 2', bedNumber: 8, 
      status: 'Admitted', diagnosis: 'SEPSIS', notes: 'Stable', rbsLog: [{ value: 68, timestamp: new Date().toISOString() }], admissionType: 'Outborn' 
    }
  ], []);

  // Fetch dynamic true patient data from database / localStorage
  useEffect(() => {
    const fetchHomepageData = async () => {
      setLoadingPatients(true);
      try {
        let registryList: Patient[] = [];
        
        // 1. If logged in, fetch from DB
        if (user?.uid) {
          registryList = await getPatients(user.uid);
        } else {
          // 2. Scan localStorage for local sessions
          if (typeof window !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('nicu_patients_')) {
                const sessionData = localStorage.getItem(key);
                if (sessionData) {
                  const list = JSON.parse(sessionData);
                  if (Array.isArray(list)) {
                    registryList = [...registryList, ...list];
                  }
                }
              }
            }
          }
        }
        setPatients(registryList);
      } catch (error) {
        console.error("Failed to load homepage census data:", error);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchHomepageData();
  }, [user]);

  // Determine active dataset (only use true database entries)
  const activeDataset = useMemo(() => {
    return patients;
  }, [patients]);

  // Filter out admitted patients
  const admittedPatients = useMemo(() => {
    return activeDataset.filter(p => p.status === 'Admitted');
  }, [activeDataset]);

  // Group admitted babies by bed number for selected unit map
  const occupiedMap = useMemo(() => {
    const map: Record<number, Patient[]> = {};
    admittedPatients.forEach(p => {
      if (p.unit === mockUnit && p.bedNumber !== undefined) {
        if (!map[p.bedNumber]) {
          map[p.bedNumber] = [];
        }
        map[p.bedNumber].push(p);
      }
    });
    return map;
  }, [admittedPatients, mockUnit]);

  // Compute live operational metrics
  const stats = useMemo(() => {
    const totalAdmitted = admittedPatients.length;
    
    // Count unique occupied beds across NICU 1 and NICU 2
    const occupiedNICU1 = new Set(admittedPatients.filter(p => p.unit === 'NICU 1' && p.bedNumber !== undefined).map(p => p.bedNumber)).size;
    const occupiedNICU2 = new Set(admittedPatients.filter(p => p.unit === 'NICU 2' && p.bedNumber !== undefined).map(p => p.bedNumber)).size;
    const totalOccupiedBeds = occupiedNICU1 + occupiedNICU2;
    const occupancyRate = totalOccupiedBeds > 0 ? Math.round((totalOccupiedBeds / 16) * 100) : 0;

    // Count observe alerts
    const observeCount = admittedPatients.filter(p => {
      const isObserveNote = p.notes?.toLowerCase().includes('observe');
      const isCriticalDx = p.diagnosis?.toLowerCase().includes('sepsis') || p.diagnosis?.toLowerCase().includes('rds');
      return isObserveNote || isCriticalDx;
    }).length;

    // Average length of stay (ALOS)
    let totalStayDays = 0;
    let closedCasesCount = 0;
    activeDataset.forEach(p => {
      if (p.status === 'Discharged') {
        const hrs = calculateHoursBetween(p.admissionDate, p.outcomeDate || '');
        if (hrs !== null && hrs >= 0) {
          totalStayDays += hrs / 24;
          closedCasesCount++;
        }
      }
    });
    const avgStay = closedCasesCount > 0 ? (totalStayDays / closedCasesCount).toFixed(1) : '0.0';

    return {
      totalAdmissions: activeDataset.length,
      currentCensus: totalAdmitted,
      occupancyRate,
      observeCount,
      avgStay
    };
  }, [activeDataset, admittedPatients]);

  const selectedBedPatients = occupiedMap[selectedMockBed] || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      
      {/* Top Banner and Actions */}
      <div className="bg-white border-b border-slate-200/60 py-6 px-4 sm:px-6 lg:px-8 text-left shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm shadow-sm">🏥</span>
              RIMS NICU Live Census Monitor
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Public, read-only operational dashboard. Only authorized medical staff can edit patient details inside the Staff Portal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {patients.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold shadow-sm transition-all animate-pulse">
                <span className="w-1.5 h-1.5 bg-emerald-550 rounded-full"></span>
                Live Registry Synced
              </span>
            )}
            <Link 
              href="/login" 
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4a7a7c] hover:bg-[#3c6365] hover:shadow-md active:scale-97 transition-all flex items-center gap-1.5 shadow-sm"
            >
              Access Staff Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Census Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          
          <div className="bg-white rounded-2xl p-5 border-t-4 border-t-[#4a7a7c] border-x border-b border-slate-200/60 shadow-sm flex flex-col justify-between h-28 hover-lift cursor-default animate-fade-in">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">NICU Census</span>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stats.currentCensus} Babies</h3>
              <span className="text-xs text-[#82a596] font-semibold block mt-0.5">Admitted cases in ward</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-t-4 border-t-blue-500 border-x border-b border-slate-200/60 shadow-sm flex flex-col justify-between h-28 hover-lift cursor-default animate-fade-in">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Bed Occupancy Rate</span>
            <div>
              <h3 className="text-2xl font-black text-blue-600 tracking-tight">{stats.occupancyRate}%</h3>
              <span className="text-xs text-slate-400 font-semibold block mt-0.5">16 Warmers Available</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-t-4 border-t-amber-500 border-x border-b border-slate-200/60 shadow-sm flex flex-col justify-between h-28 hover-lift cursor-default animate-fade-in">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Observe Alerts</span>
            <div>
              <h3 className="text-2xl font-black text-amber-600 tracking-tight">{stats.observeCount} Cases</h3>
              <span className="text-xs text-amber-700/80 font-semibold block mt-0.5">Vigilant clinical status</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-t-4 border-t-indigo-500 border-x border-b border-slate-200/60 shadow-sm flex flex-col justify-between h-28 hover-lift cursor-default animate-fade-in">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Average Stay</span>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stats.avgStay} Days</h3>
              <span className="text-xs text-[#82a596] font-semibold block mt-0.5">Discharge history log</span>
            </div>
          </div>

        </div>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Visual Bed Layout Floor Plan (Col 8) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm text-left space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span>🛏️</span> Visual Warmer Bed Map
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click a warmer bed below to inspect its pseudonymized clinical identifiers.
                </p>
              </div>

              {/* Unit Toggle Buttons */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 gap-1 shrink-0">
                {(['NICU 1', 'NICU 2'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => { setSelectedMockUnit(unit); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer active-press ${
                      mockUnit === unit
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* U-Shaped Ward Layout Grid */}
            <div key={mockUnit} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/40 animate-slide-up overflow-x-auto scrollbar-none">
              <div className="max-w-2xl mx-auto min-w-[550px] sm:min-w-0">
                
                {/* 3 columns x 4 rows layout grid */}
                <div className="grid grid-cols-3 grid-rows-4 gap-4 sm:gap-5">
                  
                  {/* Central Nursing Station Card */}
                  <div className="col-start-2 row-start-2 row-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-center items-center text-center space-y-2 hover-lift transition-all duration-300">
                    <span className="text-xs">👩‍⚕️</span>
                    <strong className="text-slate-700 text-xs font-bold block">{mockUnit} Desk</strong>
                    <div className="text-xs text-slate-450 font-bold uppercase tracking-wider block">
                      {Object.keys(occupiedMap).length} / 8 Warmers
                    </div>
                  </div>

                  {/* Warmer Bed placements */}
                  {[
                    { num: 1, grid: 'col-start-1 row-start-4' },
                    { num: 2, grid: 'col-start-1 row-start-3' },
                    { num: 3, grid: 'col-start-1 row-start-2' },
                    { num: 4, grid: 'col-start-1 row-start-1' },
                    { num: 5, grid: 'col-start-2 row-start-1' },
                    { num: 6, grid: 'col-start-3 row-start-1' },
                    { num: 7, grid: 'col-start-3 row-start-2' },
                    { num: 8, grid: 'col-start-3 row-start-3' }
                  ].map(({ num, grid }) => {
                    const bedPatients = occupiedMap[num] || [];
                    const isOccupied = bedPatients.length > 0;
                    const isSelected = selectedMockBed === num;
                    
                    // Style indicators based on patients statuses inside warmer
                    const hasObserve = bedPatients.some(p => p.notes?.toLowerCase().includes('observe') || p.diagnosis?.toLowerCase().includes('sepsis') || p.diagnosis?.toLowerCase().includes('rds'));

                    return (
                      <button
                        key={num}
                        onClick={() => setSelectedMockBed(num)}
                        className={`${grid} rounded-2xl border text-left transition-all duration-300 p-3.5 flex flex-col justify-between h-20 sm:h-22 cursor-pointer relative overflow-hidden active-press ${
                          isSelected 
                            ? 'border-blue-500 ring-4 ring-blue-100 bg-white shadow-md z-10 animate-pulse-glow-blue' 
                            : !isOccupied 
                              ? 'border-slate-200 bg-slate-100/40 hover:bg-white hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5' 
                              : hasObserve
                                ? 'border-amber-250 bg-amber-50/20 hover:bg-white hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 animate-pulse-glow-amber'
                                : 'border-emerald-250 bg-emerald-50/20 hover:bg-white hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 animate-pulse-glow-emerald'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-black text-slate-500">Bed {num}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            !isOccupied ? 'bg-slate-300' : hasObserve ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                          }`}></span>
                        </div>
                        
                        {isOccupied ? (
                          <div className="mt-2 w-full">
                            <strong className="text-xs text-slate-800 block truncate">
                              {bedPatients.length === 1 ? bedPatients[0].name : `${bedPatients[0].name} + 1`}
                            </strong>
                            <span className="text-[11px] text-[#82a596] font-bold block truncate">
                              {bedPatients[0].diagnosis}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic block mt-auto">Vacant</span>
                        )}
                      </button>
                    );
                  })}

                </div>

              </div>
            </div>

          </div>

          {/* Right Side: Bed details & Recent Events (Col 4) */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            {/* Selected Warmer Inspect Panel */}
            <div key={`${mockUnit}-${selectedMockBed}`} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4 animate-zoom-in">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Warmer Inspection</h3>
              
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <strong className="text-sm text-slate-800 flex items-center gap-1.5">
                  <span>👶</span> Bed {selectedMockBed} ({mockUnit})
                </strong>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase ${
                  selectedBedPatients.length === 0 
                    ? 'bg-slate-200 text-slate-600' 
                    : selectedBedPatients.some(p => p.notes?.toLowerCase().includes('observe'))
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  {selectedBedPatients.length === 0 ? 'Vacant' : selectedBedPatients.length === 1 ? 'Admitted' : 'Double Slot'}
                </span>
              </div>

              {selectedBedPatients.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <span className="text-2xl block">💤</span>
                  <p className="text-xs text-slate-400 italic max-w-xs mx-auto">
                    This warmer bed is currently vacant. No active clinical logs.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  {selectedBedPatients.map((patient, index) => {
                    const ageHours = calculateHoursBetween(patient.dob, new Date().toISOString());
                    const dolString = formatAgeString(ageHours);
                    const lastRbs = patient.rbsLog && patient.rbsLog.length > 0 ? `${patient.rbsLog[patient.rbsLog.length - 1].value} mg/dL` : 'N/A';

                    return (
                      <div key={patient.id} className={`space-y-3 ${index > 0 ? 'pt-4' : ''}`}>
                        {selectedBedPatients.length > 1 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black">
                            Baby #{index + 1}
                          </span>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">Patient Code</span>
                            <strong className="text-slate-800">{patient.name}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">Gestational Age</span>
                            <strong className="text-slate-800">{dolString}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">UHID Registry</span>
                            <strong className="text-slate-800">{patient.uhid}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">Blood Glucose</span>
                            <strong className="text-rose-650">{lastRbs}</strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">Primary Diagnosis</span>
                            <strong className="text-indigo-600">{patient.diagnosis}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-slate-50 p-3.5 border border-slate-200/50 rounded-2xl text-xs text-slate-500 leading-relaxed flex gap-2 items-start pt-4">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Patient Privacy Enforced:</strong>
                      <p className="mt-0.5 leading-relaxed text-[11px]">
                        Identities are pseudonymized. To update clinical measurements, log injections, or record sensitivity tests, please sign in via the Staff Portal.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Read-Only Operations Log Ticker */}
            <div key={admittedPatients.length} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4 animate-fade-in">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Ward Activity Feed</h3>
              
              <div className="space-y-3">
                {admittedPatients.length > 0 ? (
                  admittedPatients.slice(0, 3).map((p, index) => {
                    const date = new Date(p.admissionDate);
                    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={p.id} className="flex gap-2.5 items-start text-xs border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0 hover:translate-x-1 transition-transform duration-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800 block">{timeString} - Admitted ({p.unit})</span>
                          <p className="text-[11px] text-slate-450 leading-relaxed mt-0.5">
                            Patient **{p.name}** was admitted to {p.unit} Warmer Bed {p.bedNumber || 'N/A'} diagnosed with **{p.diagnosis}**.
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No recent registry admissions recorded.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Mandatory Regulatory Notice footer */}
      <div className="bg-[#fcfdfd] py-4 border-t border-[#e2ecec] text-center text-xs text-[#82a596] px-4 font-medium italic mt-auto shrink-0">
        * RIMS NICU Tracker is a read-only ward monitoring portal. Medical decisions or clinical calibrations must be verified directly with physical monitors and department policies.
      </div>

    </div>
  );

  // Helper setter wrapper
  function setSelectedMockUnit(unit: 'NICU 1' | 'NICU 2') {
    setMockUnit(unit);
    // Auto-select first bed of the unit
    setSelectedMockBed(unit === 'NICU 1' ? 1 : 2);
  }
}
