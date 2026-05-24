'use client';

import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { Bed, User, Clock, Plus, ShieldCheck, AlertCircle, Droplet, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateBiliCutoffs } from '../lib/bilirubinRules';

interface BedMapTabProps {
  patients: Patient[];
  onAdmitPatient: (unit: 'NICU 1' | 'NICU 2', bedNumber: number) => void;
  onViewPatient: (patient: Patient) => void;
  onShiftPatient: (patientId: string, targetUnit: 'NICU 1' | 'NICU 2', targetBedNumber: number) => Promise<void>;
  onAddRbs: (patientId: string, rbsValue: number) => Promise<void>;
  onAddBilirubin: (patientId: string, bilirubinValue: number) => Promise<void>;
}

// Helper utilities for date calculations
function calculateHoursBetween(startStr: string, endStr: string): number | null {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function formatAgeString(hours: number | null): string {
  if (hours === null || hours < 0) return 'Invalid';
  if (hours < 24) return `DOL 1 (${Math.floor(hours)}h)`;
  const days = Math.floor(hours / 24);
  const rem = Math.floor(hours % 24);
  return `DOL ${days + 1} (${days}d ${rem}h)`;
}

export default function BedMapTab({ 
  patients, 
  onAdmitPatient, 
  onViewPatient,
  onShiftPatient,
  onAddRbs,
  onAddBilirubin
}: BedMapTabProps) {
  const [selectedUnit, setSelectedUnit] = useState<'NICU 1' | 'NICU 2'>('NICU 1');
  const [dragOverBed, setDragOverBed] = useState<number | null>(null);
  const [expandedRbsBabyId, setExpandedRbsBabyId] = useState<string | null>(null);
  const [rbsInputValues, setRbsInputValues] = useState<Record<string, string>>({});
  const [expandedBiliBabyId, setExpandedBiliBabyId] = useState<string | null>(null);
  const [biliInputValues, setBiliInputValues] = useState<Record<string, string>>({});

  // Group active admitted patients in selected unit by bed number (can be multiple per bed)
  const occupiedMap = useMemo(() => {
    const map: Record<number, Patient[]> = {};
    patients.forEach(p => {
      if (p.status === 'Admitted' && p.unit === selectedUnit && p.bedNumber !== undefined) {
        if (!map[p.bedNumber]) {
          map[p.bedNumber] = [];
        }
        map[p.bedNumber].push(p);
      }
    });
    return map;
  }, [patients, selectedUnit]);

  // Compute stats
  const totalOccupiedBeds = useMemo(() => {
    return Object.keys(occupiedMap).filter(key => occupiedMap[Number(key)]?.length > 0).length;
  }, [occupiedMap]);

  const totalPatientsCount = useMemo(() => {
    let count = 0;
    Object.values(occupiedMap).forEach(arr => {
      count += arr.length;
    });
    return count;
  }, [occupiedMap]);

  const occupancyPercentage = (totalOccupiedBeds / 8) * 100;

  // Bed coordinates for U-shaped grid:
  // Row 1 (top): Bed 4, Bed 5, Bed 6
  // Row 2: Bed 3, (center nursing desk), Bed 7
  // Row 3: Bed 2, (center nursing desk), Bed 8
  // Row 4 (bottom): Bed 1, (empty), (empty)
  const bedGridPositions = [
    { bedNum: 1, gridClass: 'sm:col-start-1 sm:row-start-4' },
    { bedNum: 2, gridClass: 'sm:col-start-1 sm:row-start-3' },
    { bedNum: 3, gridClass: 'sm:col-start-1 sm:row-start-2' },
    { bedNum: 4, gridClass: 'sm:col-start-1 sm:row-start-1' },
    { bedNum: 5, gridClass: 'sm:col-start-2 sm:row-start-1' },
    { bedNum: 6, gridClass: 'sm:col-start-3 sm:row-start-1' },
    { bedNum: 7, gridClass: 'sm:col-start-3 sm:row-start-2' },
    { bedNum: 8, gridClass: 'sm:col-start-3 sm:row-start-3' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header controls and statistics */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm text-left">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm">🛏️</span>
            Ward Bed Layout Map
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Drag and drop patients to shift beds. Expand a baby card to log Random Blood Sugar (RBS). Warmers can host up to 2 babies.
          </p>
        </div>

        {/* Toggle units */}
        <div className="flex items-center gap-4 self-center md:self-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 gap-1">
            {(['NICU 1', 'NICU 2'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active-press ${
                  selectedUnit === unit
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Visual Floor Plan Grid */}
        <div className="lg:col-span-8 bg-slate-55 bg-slate-50 border border-slate-200/60 rounded-[2rem] p-3 sm:p-8 text-center overflow-x-auto scrollbar-none">
          
          <div className="max-w-3xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:grid-rows-[auto_auto_auto_auto] gap-4 sm:gap-6">
              {/* Central Desk Widget */}
              <div className="col-span-1 sm:col-start-2 sm:row-start-2 sm:row-span-2 sm:col-span-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm p-2 sm:p-4 flex flex-col justify-center items-center text-center space-y-1.5 sm:space-y-3 hover-lift transition-all duration-300 order-first sm:order-none">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest block">Nursing Desk</span>
                  <strong className="text-slate-700 text-[10px] sm:text-xs font-bold block mt-0.5">{selectedUnit} Station</strong>
                </div>
                <div className="border-t border-slate-100 pt-1.5 sm:pt-2 w-full">
                  <div className="text-sm sm:text-lg font-black text-blue-600 tracking-tight">{totalPatientsCount} Patient{totalPatientsCount !== 1 ? 's' : ''}</div>
                  <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">{totalOccupiedBeds} / 8 Warmers Active</span>
                  <div className="w-full bg-slate-100 h-1 sm:h-1.5 rounded-full overflow-hidden mt-1 sm:mt-1.5">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-500" 
                      style={{ width: `${occupancyPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Beds Rendering */}
              {bedGridPositions.map(({ bedNum, gridClass }) => {
                const bedPatients = occupiedMap[bedNum] || [];
                const isOccupied = bedPatients.length > 0;
                const isDragTarget = dragOverBed === bedNum;

                return (
                  <div
                    key={bedNum}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setDragOverBed(bedNum)}
                    onDragLeave={() => setDragOverBed(null)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragOverBed(null);
                      const patientId = e.dataTransfer.getData('text/plain');
                      if (patientId) {
                        await onShiftPatient(patientId, selectedUnit, bedNum);
                      }
                    }}
                    className={`${gridClass} rounded-[1.25rem] sm:rounded-[1.5rem] transition-all duration-300 flex flex-col justify-between items-stretch text-left relative overflow-hidden ${
                      isOccupied 
                        ? 'bg-white border border-slate-200/85 p-2 sm:p-3.5 space-y-1.5 sm:space-y-3 shadow-sm hover-lift hover:border-slate-350'
                        : 'border border-dashed border-slate-300 bg-slate-100/40 p-2 sm:p-3.5 hover:bg-white hover:border-slate-450 hover:shadow-sm hover:-translate-y-0.5'
                    } ${isDragTarget ? 'border-blue-500 border-2 bg-blue-50/30 scale-102 ring-4 ring-blue-100 z-10' : ''}`}
                  >
                    {/* Header Bar */}
                    <div className="flex justify-between items-center text-[9px] sm:text-xs pb-1 sm:pb-1.5 border-b border-slate-100">
                      <span className={`font-black flex items-center gap-0.5 sm:gap-1 ${isOccupied ? 'text-slate-800' : 'text-slate-400'}`}>
                        <Bed className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-blue-500 shrink-0" />
                        Bed {bedNum}
                      </span>
                      {isOccupied ? (
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <span className={`w-1 sm:w-2 h-1 sm:h-2 rounded-full ${bedPatients.length >= 2 ? 'bg-orange-500' : 'bg-blue-500'} animate-pulse`}></span>
                          <span className="text-[8px] sm:text-xs font-black text-slate-400">{bedPatients.length}/2 slots</span>
                        </span>
                      ) : (
                        <span className="w-0.5 h-0.5 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300"></span>
                      )}
                    </div>

                    {/* Content Section */}
                    {isOccupied ? (
                      <div className="space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2 divide-y divide-slate-100">
                          {bedPatients.map((patient, index) => {
                            const ageHours = calculateHoursBetween(patient.dob, new Date().toISOString());
                            const dolString = formatAgeString(ageHours);
                            const isRbsExpanded = expandedRbsBabyId === patient.id;
                            const isBiliExpanded = expandedBiliBabyId === patient.id;

                            const lastBiliLog = patient.bilirubinLog && patient.bilirubinLog.length > 0 ? patient.bilirubinLog[patient.bilirubinLog.length - 1] : null;
                            let biliBadge = null;
                            if (lastBiliLog) {
                              const gaWeeks = patient.gestationalAgeWeeks !== undefined ? patient.gestationalAgeWeeks : 38;
                              const hasRisk = patient.hasNeuroRisk || false;
                              const currentAgeHours = calculateHoursBetween(patient.dob, new Date().toISOString()) || 0;
                              const biliHours = calculateHoursBetween(patient.dob, lastBiliLog.timestamp) || currentAgeHours;
                              const res = calculateBiliCutoffs(gaWeeks, biliHours, hasRisk, lastBiliLog.value);
                              biliBadge = {
                                label: res.classification.label,
                                color: res.classification.color,
                                value: lastBiliLog.value
                              };
                            }

                            return (
                              <div 
                                key={patient.id} 
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', patient.id!);
                                }}
                                className={`pt-2 first:pt-0 cursor-grab active:cursor-grabbing hover:bg-slate-50/50 rounded-lg p-1 transition-all relative border border-transparent hover:border-slate-100`}
                                title="Drag to move baby to another bed"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="space-y-0.5">
                                    <h4 className="text-[9px] sm:text-xs font-black text-slate-800 flex items-center gap-0.5 sm:gap-1">
                                      <span className="text-[8px] sm:text-[10px]">👶</span>
                                      {patient.name}
                                    </h4>
                                    <p className="text-[8px] sm:text-xs font-bold text-slate-400 flex items-center gap-1 flex-wrap">
                                      <span>{patient.uhid}</span>
                                      {patient.culturePositive && (
                                        <span className="inline-flex items-center gap-0.5 px-0.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-100 font-black text-[7px] sm:text-[9px] leading-none" title={`Culture: ${patient.cultureOrganism === 'Other' ? patient.cultureOrganismOther : patient.cultureOrganism}`}>
                                          🦠 POS
                                        </span>
                                      )}
                                      {biliBadge && (
                                        <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded font-black text-[7px] sm:text-[9px] leading-none border ${biliBadge.color}`} title={`Bilirubin: ${biliBadge.value} mg/dL`}>
                                          💡 {biliBadge.label} ({biliBadge.value})
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[8px] sm:text-xs font-black text-slate-700 bg-slate-100 px-0.5 sm:px-1 rounded">{dolString}</span>
                                  </div>
                                </div>

                                <div className="mt-1.5 pt-1 border-t border-slate-100 flex flex-col gap-1.5">
                                  <div className="text-[8px] sm:text-xs text-slate-500 font-semibold truncate">
                                    Dx: <strong className="text-indigo-600">{patient.diagnosis}</strong>
                                  </div>
                                  <div className="flex flex-wrap items-center justify-between gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); onViewPatient(patient); }}
                                      className="text-slate-400 hover:text-blue-600 text-[8px] sm:text-[11px] uppercase font-black py-0.5"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedRbsBabyId(isRbsExpanded ? null : patient.id!);
                                        setExpandedBiliBabyId(null);
                                      }}
                                      className={`text-rose-505 hover:text-rose-600 text-[7px] sm:text-[11px] uppercase font-black flex items-center gap-0.5 bg-rose-50 px-1 py-0.5 rounded ${isRbsExpanded ? 'ring-1 ring-rose-250 font-extrabold' : ''}`}
                                    >
                                      <Droplet className="w-1.5 sm:w-2 h-1.5 sm:h-2 text-rose-550 shrink-0" />
                                      RBS {isRbsExpanded ? '▲' : '▼'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedBiliBabyId(isBiliExpanded ? null : patient.id!);
                                        setExpandedRbsBabyId(null);
                                      }}
                                      className={`text-amber-650 hover:text-amber-700 text-[7px] sm:text-[11px] uppercase font-black flex items-center gap-0.5 bg-amber-50 px-1 py-0.5 rounded ${isBiliExpanded ? 'ring-1 ring-amber-250 font-extrabold' : ''}`}
                                    >
                                      <Droplet className="w-1.5 sm:w-2 h-1.5 sm:h-2 text-amber-550 shrink-0" />
                                      Bili {isBiliExpanded ? '▲' : '▼'}
                                    </button>
                                  </div>
                                </div>

                                {/* RBS Sub-panel */}
                                {isRbsExpanded && (
                                  <div className="mt-2 bg-rose-50/50 p-2 rounded-xl border border-rose-100 space-y-1.5 text-[9px] sm:text-xs text-left animate-slide-up" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center font-bold text-rose-950">
                                      <span>RBS Readings</span>
                                      <span className="text-[8px] sm:text-[10px] text-rose-600">Glucose</span>
                                    </div>
                                    
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                      {patient.rbsLog && patient.rbsLog.length > 0 ? (
                                        patient.rbsLog.slice(-3).reverse().map((log, idx) => (
                                          <div key={idx} className="flex justify-between items-center bg-white px-1.5 py-0.5 rounded border border-rose-100/50">
                                            <span className="font-extrabold text-rose-700">{log.value} mg/dL</span>
                                            <span className="text-[8px] sm:text-[10px] text-slate-400">
                                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-[10px] sm:text-[11px] text-slate-450 italic block">No sugar logs.</span>
                                      )}
                                    </div>

                                    <div className="flex gap-1 pt-1 border-t border-rose-100">
                                      <input
                                        type="number"
                                        placeholder="75"
                                        value={rbsInputValues[patient.id!] || ''}
                                        onChange={(e) => setRbsInputValues(prev => ({ ...prev, [patient.id!]: e.target.value }))}
                                        className="w-12 bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-800 outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const val = parseInt(rbsInputValues[patient.id!] || '');
                                          if (isNaN(val) || val <= 0) return;
                                          await onAddRbs(patient.id!, val);
                                          setRbsInputValues(prev => ({ ...prev, [patient.id!]: '' }));
                                        }}
                                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-2 py-0.5 rounded text-[10px] sm:text-xs cursor-pointer transition-colors"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Bili Sub-panel */}
                                {isBiliExpanded && (
                                  <div className="mt-2 bg-amber-50/50 p-1.5 sm:p-2 rounded-xl border border-amber-100 space-y-1.5 text-[8px] sm:text-xs text-left animate-slide-up" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center font-bold text-amber-950">
                                      <span>Bilirubin Readings</span>
                                      <span className="text-[7px] sm:text-[10px] text-amber-600">Serum Bili</span>
                                    </div>
                                    
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                      {patient.bilirubinLog && patient.bilirubinLog.length > 0 ? (
                                        patient.bilirubinLog.slice(-3).reverse().map((log, idx) => {
                                          const gaWeeks = patient.gestationalAgeWeeks !== undefined ? patient.gestationalAgeWeeks : 38;
                                          const hasRisk = patient.hasNeuroRisk || false;
                                          const currentAgeHours = calculateHoursBetween(patient.dob, new Date().toISOString()) || 0;
                                          const biliHours = calculateHoursBetween(patient.dob, log.timestamp) || currentAgeHours;
                                          const res = calculateBiliCutoffs(gaWeeks, biliHours, hasRisk, log.value);
                                          const shortLabels: Record<string, string> = {
                                            safe: 'Safe',
                                            monitor: 'Monitor',
                                            photo: 'Photo',
                                            warning: 'Escalate',
                                            critical: 'Exchange'
                                          };
                                          const shortLabel = shortLabels[res.classification.type] || res.classification.label;
                                          
                                          return (
                                            <div key={idx} className="flex flex-col bg-white p-1.5 rounded border border-amber-100/50 space-y-1">
                                              <div className="flex justify-between items-center">
                                                <span className="font-extrabold text-amber-700 text-[9px] sm:text-xs">{log.value} mg/dL</span>
                                                <span className="text-[7px] sm:text-[9px] text-slate-450 font-semibold">
                                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                              </div>
                                              <div className="flex justify-between items-center text-[7px] sm:text-[9px] border-t border-slate-50 pt-1 gap-1">
                                                <span className="text-slate-400 font-semibold truncate">P: ≥{res.phototherapy} | E: ≥{res.exchange}</span>
                                                <span className={`px-1 py-0.2 rounded font-black border text-[7px] sm:text-[9px] leading-none shrink-0 ${res.classification.color}`}>
                                                  {shortLabel}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <span className="text-[8px] sm:text-[10px] text-slate-450 italic block">No bilirubin logs.</span>
                                      )}
                                    </div>

                                    <div className="flex gap-1 pt-1 border-t border-amber-100">
                                      <input
                                        type="number"
                                        step="0.1"
                                        placeholder="12.5"
                                        value={biliInputValues[patient.id!] || ''}
                                        onChange={(e) => setBiliInputValues(prev => ({ ...prev, [patient.id!]: e.target.value }))}
                                        className="w-12 bg-white border border-slate-200 rounded px-1 py-0.5 text-[8px] sm:text-xs font-semibold text-slate-800 outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const val = parseFloat(biliInputValues[patient.id!] || '');
                                          if (isNaN(val) || val <= 0) return;
                                          await onAddBilirubin(patient.id!, val);
                                          setBiliInputValues(prev => ({ ...prev, [patient.id!]: '' }));
                                        }}
                                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-0.5 rounded text-[8px] sm:text-xs cursor-pointer transition-colors"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Stacking vacant slot if only 1 baby */}
                        {bedPatients.length === 1 && (
                          <button
                            type="button"
                            onClick={() => onAdmitPatient(selectedUnit, bedNum)}
                            className="w-full border border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-350 text-center py-1.5 rounded-xl text-[10px] sm:text-xs font-bold text-slate-400 hover:text-slate-655 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-slate-400" />
                            Vacant (Slot 2)
                          </button>
                        )}
                      </div>
                    ) : (
                      // Fully Vacant card
                      <button
                        type="button"
                        onClick={() => onAdmitPatient(selectedUnit, bedNum)}
                        className="w-full flex-1 flex flex-col justify-center items-center py-3 sm:py-6 text-center focus:outline-none cursor-pointer group"
                      >
                        <Plus className="w-4 sm:w-5 h-4 sm:h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] sm:text-xs text-slate-400 group-hover:text-slate-600 font-bold mt-0.5 sm:mt-1">Vacant</span>
                        <span className="text-[8px] sm:text-[11px] font-black uppercase text-slate-400 group-hover:text-blue-600 text-center tracking-wider transition-colors pt-1.5 sm:pt-2 mt-1.5 sm:mt-2 border-t border-transparent group-hover:border-slate-200/50 w-full">
                          + Admit
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

        </div>

        {/* Informational Panel & Legend */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Ward Statistics Card */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ward Summary</h3>
            
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Selected Location</span>
                <strong className="text-slate-800 font-bold">{selectedUnit}</strong>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Warmers Occupied</span>
                <strong className="text-blue-600 font-black">{totalOccupiedBeds} / 8 Warmers</strong>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Baby Census</span>
                <strong className="text-slate-850 font-extrabold">{totalPatientsCount} Babies</strong>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Ward Active Capacity</span>
                <strong className="text-emerald-650 font-black">{(totalPatientsCount / 16 * 100).toFixed(0)}% (Max 16)</strong>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200/50 rounded-2xl text-[10px] text-slate-500 leading-relaxed space-y-2">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-3.5 h-3.5 text-slate-450 shrink-0 mt-0.5" />
                <div>
                  <strong>Ward Management Guidelines:</strong>
                  <p className="mt-0.5 leading-relaxed">
                    - Drag and drop baby card headers to relocate them into other warmers.
                    <br />
                    - Double occupancy is allowed to support twins or emergency capacity spikes.
                    <br />
                    - Toggle the RBS panel to log blood glucose metrics without navigating away from the floor plan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Interactive Legend */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legend & Statuses</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-black text-blue-500 shrink-0">🛏️</span>
                <div>
                  <strong className="text-slate-800 font-bold block">Occupied Warmer</strong>
                  <span className="text-[10px] text-slate-500 leading-snug">
                    Warmer with at least 1 baby. Stacks up to 2 babies. Click "RBS" to view blood sugar trend logs.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-slate-50 border border-dashed border-slate-350 rounded shrink-0 flex items-center justify-center text-[10px] font-black text-slate-400">+</span>
                <div>
                  <strong className="text-slate-800 font-bold block">Vacant Warmer</strong>
                  <span className="text-[10px] text-slate-500 leading-snug">
                    Fully unoccupied. Click to admit a baby directly.
                  </span>
                </div>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
