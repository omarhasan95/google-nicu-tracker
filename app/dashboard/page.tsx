'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  getPatients, 
  addPatient, 
  updatePatient, 
  deletePatient 
} from '../../lib/dbService';
import { Patient } from '../../types';
import CalculatorsTab from '../../components/CalculatorsTab';
import BedMapTab from '../../components/BedMapTab';
import { 
  Baby, 
  Calendar, 
  ClipboardList, 
  Download, 
  FileText, 
  LineChart, 
  Plus, 
  Trash2, 
  User, 
  Heart,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Activity,
  Smile,
  LogOut,
  Hospital,
  ShieldCheck,
  Search,
  Printer,
  Clock,
  Settings,
  HelpCircle,
  Grid,
  FlaskConical
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Admitted', label: 'Admitted', color: 'bg-blue-50 text-blue-700 ring-blue-600/20 border border-blue-200', hex: '#3b82f6', icon: '🏥', gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/30' },
  { value: 'Discharged', label: 'Discharged', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 border border-emerald-200', hex: '#10b981', icon: '🏠', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30' },
  { value: 'Died', label: 'Death', color: 'bg-rose-50 text-rose-700 ring-rose-600/20 border border-rose-200', hex: '#f43f5e', icon: '💔', gradient: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/30' },
  { value: 'LAMA', label: 'LAMA', color: 'bg-amber-50 text-amber-700 ring-amber-600/20 border border-amber-200', hex: '#f59e0b', icon: '⚠️', gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/30' },
  { value: 'Transferred', label: 'Transfer', color: 'bg-purple-50 text-purple-700 ring-purple-600/20 border border-purple-200', hex: '#8b5cf6', icon: '➡️', gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/30' }
];

const DIAGNOSIS_OPTIONS = ['Pre Term', 'Severe Birth Asphyxia', 'SEPSIS', 'RDS', 'Others'];
const COMMON_ORGANISMS = [
  'Klebsiella pneumoniae',
  'Escherichia coli',
  'Pseudomonas aeruginosa',
  'Staphylococcus aureus',
  'Acinetobacter baumannii',
  'Enterococcus faecalis',
  'Group B Streptococcus',
  'Candida albicans',
  'Other'
];
const ANTIBIOTIC_OPTIONS = [
  'Amikacin',
  'Gentamicin',
  'Piperacillin-Tazobactam',
  'Meropenem',
  'Imipenem',
  'Ceftriaxone',
  'Cefotaxime',
  'Ceftazidime',
  'Ciprofloxacin',
  'Levofloxacin',
  'Vancomycin',
  'Linezolid',
  'Colistin',
  'Polymyxin B',
  'Ampicillin',
  'Penicillin G',
  'None'
];
const SENSITIVITY_PATTERNS = [
  { value: 'S', label: 'Sensitive (S)' },
  { value: 'I', label: 'Intermediate (I)' },
  { value: 'R', label: 'Resistant (R)' }
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DISPLAY_LOCALE = "en-GB";

// Helper utilities
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

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function downloadCSV(csvArray: string[][], filename: string) {
  const csvContent = "data:text/csv;charset=utf-8," 
    + csvArray.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Dashboard() {
  const { user, loading, logout, isMock } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // App States
  const [activeTab, setActiveTab] = useState<'tracker' | 'bedmap' | 'reports' | 'calculators' | 'cultures'>('tracker');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [reportFilterPreset, setReportFilterPreset] = useState('This Month');
  const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' });

  // Alerts/Modals
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formUhid, setFormUhid] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formAdmissionDate, setFormAdmissionDate] = useState('');
  const [formUnit, setFormUnit] = useState<'NICU' | 'NICU 1' | 'NICU 2' | 'SNCU'>('NICU 1');
  const [formBedNumber, setFormBedNumber] = useState<number | ''>('');
  const [formAdmissionType, setFormAdmissionType] = useState<'Inborn' | 'Outborn'>('Inborn');
  const [formDiagnosis, setFormDiagnosis] = useState('Pre Term');
  const [formStatus, setFormStatus] = useState('Admitted');
  const [formOutcomeDate, setFormOutcomeDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Culture Positivity Form States
  const [formCulturePositive, setFormCulturePositive] = useState(false);
  const [formCultureOrganism, setFormCultureOrganism] = useState('Klebsiella pneumoniae');
  const [formCultureOrganismOther, setFormCultureOrganismOther] = useState('');
  const [formCultureSensitivity1, setFormCultureSensitivity1] = useState('Amikacin');
  const [formCultureSensitivity1Pattern, setFormCultureSensitivity1Pattern] = useState<'S' | 'I' | 'R' | ''>('');
  const [formCultureSensitivity2, setFormCultureSensitivity2] = useState('Meropenem');
  const [formCultureSensitivity2Pattern, setFormCultureSensitivity2Pattern] = useState<'S' | 'I' | 'R' | ''>('');
  const [modalTab, setModalTab] = useState<'admission' | 'culture'>('admission');

  // Culture Registry Search and Filters
  const [cultureSearchQuery, setCultureSearchQuery] = useState('');
  const [cultureFilter, setCultureFilter] = useState<'All' | 'Positive' | 'Negative/Pending'>('All');

  const cultureFilteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(cultureSearchQuery.toLowerCase()) ||
        p.uhid.toLowerCase().includes(cultureSearchQuery.toLowerCase());
      
      const matchesFilter = 
        cultureFilter === 'All' ||
        (cultureFilter === 'Positive' && p.culturePositive) ||
        (cultureFilter === 'Negative/Pending' && !p.culturePositive);
        
      return matchesSearch && matchesFilter;
    });
  }, [patients, cultureSearchQuery, cultureFilter]);

  // Fetch Patients Registry
  const fetchPatientsList = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const data = await getPatients(user.uid);
      setPatients(data);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to fetch patients registry', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatientsList();
    }
  }, [user]);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Calculate stats cards values
  const stats = useMemo(() => {
    return {
      total: patients.length,
      admitted: patients.filter(p => p.status === 'Admitted').length,
      discharged: patients.filter(p => p.status === 'Discharged').length,
      died: patients.filter(p => p.status === 'Died').length,
      lama: patients.filter(p => p.status === 'LAMA').length,
      transferred: patients.filter(p => p.status === 'Transferred').length,
    };
  }, [patients]);

  // Registry Listing Filter
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const nameMatch = p.name ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const uhidMatch = p.uhid ? p.uhid.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const matchesSearch = !searchQuery || nameMatch || uhidMatch;
      const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchQuery, filterStatus]);

  // Occupied beds mapper for layout safety check during admissions (allows sharing up to 2 babies)
  const occupiedBedsMap = useMemo(() => {
    const map: Record<number, Patient[]> = {};
    patients.forEach(p => {
      if (p.status === 'Admitted' && p.unit === formUnit && p.bedNumber !== undefined) {
        if (!editingPatient || p.id !== editingPatient.id) {
          if (!map[p.bedNumber]) {
            map[p.bedNumber] = [];
          }
          map[p.bedNumber].push(p);
        }
      }
    });
    return map;
  }, [patients, formUnit, editingPatient]);

  // Enhanced Reporting and KPI Aggregates
  const activeReportData = useMemo(() => {
    let start = new Date();
    let end = new Date();
    let isDaily = false;
    const now = new Date();

    if (reportFilterPreset === 'All Time') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date();
      if (patients.length > 0) {
        const dates = patients.map(p => new Date(p.admissionDate).getTime()).filter(t => !isNaN(t));
        if (dates.length > 0) start = new Date(Math.min(...dates));
      }
      start = new Date(start.getFullYear(), start.getMonth(), 1); 
    } else if (reportFilterPreset === 'This Month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1); 
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      isDaily = true;
    } else if (reportFilterPreset === 'Last Month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1); 
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      isDaily = true;
    } else if (reportFilterPreset === 'Custom') {
      start = reportDateRange.start ? new Date(reportDateRange.start) : new Date(now.getFullYear(), 0, 1);
      end = reportDateRange.end ? new Date(reportDateRange.end) : new Date(); 
      end.setHours(23, 59, 59, 999);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 31) isDaily = true;
    }

    const reportFiltered = patients.filter(p => {
      if (!p.admissionDate) return false;
      const d = new Date(p.admissionDate);
      return d >= start && d <= end;
    });

    let totalDischarged = 0;
    let totalStayHours = 0;
    let totalClosedOutcomes = 0;

    reportFiltered.forEach(p => {
      if (p.status !== 'Admitted' && p.status !== 'Transferred') {
        totalClosedOutcomes++;
      }
      if (p.status === 'Discharged') {
        totalDischarged++;
        const hours = calculateHoursBetween(p.admissionDate, p.outcomeDate || '');
        if (hours !== null && hours >= 0) totalStayHours += hours;
      }
    });

    const kpis = {
      totalAdmissions: reportFiltered.length,
      survivalRate: totalClosedOutcomes > 0 ? ((totalDischarged / totalClosedOutcomes) * 100).toFixed(1) : '0',
      alos: totalDischarged > 0 ? (totalStayHours / 24 / totalDischarged).toFixed(1) : '0',
      nicuCount: reportFiltered.filter(p => p.unit === 'NICU' || p.unit === 'NICU 1' || p.unit === 'NICU 2').length,
      sncuCount: reportFiltered.filter(p => p.unit === 'SNCU').length,
      directCount: reportFiltered.filter(p => p.admissionType === 'Inborn' || (p.admissionType as string) === 'Direct').length,
      transferCount: reportFiltered.filter(p => p.admissionType === 'Outborn' || (p.admissionType as string) === 'Transfer in').length
    };

    const buckets = [];
    const current = new Date(start);

    if (isDaily) {
      while (current <= end) {
        const label = current.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const bucketStart = new Date(current); 
        bucketStart.setHours(0,0,0,0);
        const bucketEnd = new Date(current); 
        bucketEnd.setHours(23,59,59,999);
        buckets.push({ label, start: bucketStart, end: bucketEnd });
        current.setDate(current.getDate() + 1);
      }
    } else {
      current.setDate(1); 
      while (current <= end || (current.getMonth() === end.getMonth() && current.getFullYear() === end.getFullYear())) {
        const label = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const bucketStart = new Date(current.getFullYear(), current.getMonth(), 1);
        const bucketEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59);
        buckets.push({ label, start: bucketStart, end: bucketEnd });
        current.setMonth(current.getMonth() + 1);
      }
    }

    const bucketStats = buckets.map(b => {
      const timePatients = reportFiltered.filter(p => {
        const d = new Date(p.admissionDate); 
        return d >= b.start && d <= b.end;
      });
      
      const deaths = timePatients.filter(p => p.status === 'Died');
      let deathUnder24 = 0; 
      let death1to7d = 0; 
      let death8to28d = 0; 
      let deathOver28d = 0;

      deaths.forEach(p => {
        const hrs = calculateHoursBetween(p.dob, p.outcomeDate || '');
        if (hrs === null || hrs < 0) return;
        if (hrs < 24) deathUnder24++; 
        else if (hrs >= 24 && hrs < 168) death1to7d++; 
        else if (hrs >= 168 && hrs <= 672) death8to28d++; 
        else deathOver28d++;
      });

      return {
        label: b.label,
        total: timePatients.length,
        nicuAdmissions: timePatients.filter(p => p.unit === 'NICU' || p.unit === 'NICU 1' || p.unit === 'NICU 2').length,
        sncuTotal: timePatients.filter(p => p.unit === 'SNCU').length,
        totalDeaths: deaths.length,
        nicuDeaths: timePatients.filter(p => p.status === 'Died' && (p.unit === 'NICU' || p.unit === 'NICU 1' || p.unit === 'NICU 2')).length,
        sncuDeaths: timePatients.filter(p => p.status === 'Died' && p.unit === 'SNCU').length,
        totalDischarge: timePatients.filter(p => p.status === 'Discharged').length,
        nicuDischarge: timePatients.filter(p => p.status === 'Discharged' && (p.unit === 'NICU' || p.unit === 'NICU 1' || p.unit === 'NICU 2')).length,
        sncuDischarge: timePatients.filter(p => p.status === 'Discharged' && p.unit === 'SNCU').length,
        lama: timePatients.filter(p => p.status === 'LAMA').length,
        transfer: timePatients.filter(p => p.status === 'Transferred').length,
        deathUnder24,
        death1to7d,
        death8to28d,
        deathOver28d
      };
    });

    return { filteredPatients: reportFiltered, bucketStats, isDaily, kpis };
  }, [patients, reportFilterPreset, reportDateRange]);

  // Trend Charts
  const trendChartData = useMemo(() => {
    return activeReportData.bucketStats
      .map(r => ({
        label: r.label,
        admissions: r.total,
        discharges: r.totalDischarge
      }))
      .filter(r => r.admissions > 0 || r.discharges > 0);
  }, [activeReportData]);

  // Donut Outcomes Mix
  const donutChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeReportData.filteredPatients.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return STATUS_OPTIONS.map(opt => ({
      label: opt.label,
      value: counts[opt.value] || 0,
      color: opt.hex
    })).filter(d => d.value > 0);
  }, [activeReportData]);

  // Automated Demographic & Clinical Profile Analysis Engine
  const demographics = useMemo(() => {
    const total = patients.length;
    if (total === 0) {
      return {
        runnable: false,
        total: 0,
        ageGroup1: { count: 0, pct: '0' },
        ageGroup2: { count: 0, pct: '0' },
        ageGroup3: { count: 0, pct: '0' },
        meanAge: '0.0',
        sdAge: '0.0',
        dxCounts: {} as Record<string, number>,
        unitCounts: {} as Record<string, number>,
        admissionTypeCounts: { Inborn: 0, Outborn: 0 },
        outcomesByUnit: { 
          nicu: { Admitted: 0, Discharged: 0, Died: 0, LAMA: 0, Transferred: 0 } as Record<string, number>, 
          sncu: { Admitted: 0, Discharged: 0, Died: 0, LAMA: 0, Transferred: 0 } as Record<string, number>
        },
        culture: {
          positiveCount: 0,
          pathogenCounts: {} as Record<string, number>,
          resistanceR: 0,
          resistanceI: 0,
          resistanceS: 0,
          totalSensitivityTested: 0
        }
      };
    }

    // 1. Age on Admission
    let ageHrsList: number[] = [];
    let ageGroup1 = 0; // < 24h
    let ageGroup2 = 0; // 24h - 72h
    let ageGroup3 = 0; // > 72h

    patients.forEach(p => {
      const hrs = calculateHoursBetween(p.dob, p.admissionDate);
      if (hrs !== null && hrs >= 0) {
        ageHrsList.push(hrs);
        if (hrs < 24) ageGroup1++;
        else if (hrs <= 72) ageGroup2++;
        else ageGroup3++;
      }
    });

    const meanAge = ageHrsList.length > 0 ? ageHrsList.reduce((sum, val) => sum + val, 0) / ageHrsList.length : 0;
    const varianceAge = ageHrsList.length > 1 ? ageHrsList.reduce((sum, val) => sum + Math.pow(val - meanAge, 2), 0) / (ageHrsList.length - 1) : 0;
    const sdAge = Math.sqrt(varianceAge);

    // 2. Diagnoses
    const dxCounts: Record<string, number> = {};
    DIAGNOSIS_OPTIONS.forEach(dx => { dxCounts[dx] = 0; });
    patients.forEach(p => {
      const dx = p.diagnosis || 'Others';
      const key = DIAGNOSIS_OPTIONS.includes(dx) ? dx : 'Others';
      dxCounts[key] = (dxCounts[key] || 0) + 1;
    });

    // 3. Units
    const unitCounts: Record<string, number> = { 'NICU 1': 0, 'NICU 2': 0, 'SNCU': 0 };
    patients.forEach(p => {
      if (p.unit === 'NICU 1') unitCounts['NICU 1']++;
      else if (p.unit === 'NICU 2') unitCounts['NICU 2']++;
      else if (p.unit === 'SNCU') unitCounts['SNCU']++;
      else if (p.unit === 'NICU') unitCounts['NICU 1']++; // legacy fallback
    });

    // 4. Admission Type
    const admissionTypeCounts = { Inborn: 0, Outborn: 0 };
    patients.forEach(p => {
      if (p.admissionType === 'Inborn' || (p.admissionType as string) === 'Direct') admissionTypeCounts.Inborn++;
      else admissionTypeCounts.Outborn++;
    });

    // 5. Outcomes by Unit
    const outcomesByUnit: Record<string, Record<string, number>> = {
      nicu: { Admitted: 0, Discharged: 0, Died: 0, LAMA: 0, Transferred: 0 },
      sncu: { Admitted: 0, Discharged: 0, Died: 0, LAMA: 0, Transferred: 0 }
    };
    patients.forEach(p => {
      const unitKey = (p.unit === 'SNCU') ? 'sncu' : 'nicu';
      const status = p.status || 'Admitted';
      if (outcomesByUnit[unitKey][status] !== undefined) {
        outcomesByUnit[unitKey][status]++;
      }
    });

    // 6. Culture Data Analysis
    let culturePositiveCount = 0;
    const pathogenCounts: Record<string, number> = {};
    let resistanceR = 0;
    let resistanceI = 0;
    let resistanceS = 0;
    let totalSensitivityTested = 0;

    patients.forEach(p => {
      if (p.culturePositive) {
        culturePositiveCount++;
        const org = p.cultureOrganism === 'Other' ? (p.cultureOrganismOther || 'Other') : (p.cultureOrganism || 'Unknown');
        pathogenCounts[org] = (pathogenCounts[org] || 0) + 1;

        if (p.cultureSensitivity1Pattern) {
          totalSensitivityTested++;
          if (p.cultureSensitivity1Pattern === 'R') resistanceR++;
          else if (p.cultureSensitivity1Pattern === 'I') resistanceI++;
          else if (p.cultureSensitivity1Pattern === 'S') resistanceS++;
        }

        if (p.cultureSensitivity2Pattern) {
          totalSensitivityTested++;
          if (p.cultureSensitivity2Pattern === 'R') resistanceR++;
          else if (p.cultureSensitivity2Pattern === 'I') resistanceI++;
          else if (p.cultureSensitivity2Pattern === 'S') resistanceS++;
        }
      }
    });

    return {
      runnable: true,
      total,
      ageGroup1: { count: ageGroup1, pct: ((ageGroup1 / total) * 100).toFixed(1) },
      ageGroup2: { count: ageGroup2, pct: ((ageGroup2 / total) * 100).toFixed(1) },
      ageGroup3: { count: ageGroup3, pct: ((ageGroup3 / total) * 100).toFixed(1) },
      meanAge: meanAge.toFixed(1),
      sdAge: sdAge.toFixed(1),
      dxCounts,
      unitCounts,
      admissionTypeCounts,
      outcomesByUnit,
      culture: {
        positiveCount: culturePositiveCount,
        pathogenCounts,
        resistanceR,
        resistanceI,
        resistanceS,
        totalSensitivityTested
      }
    };
  }, [patients]);

  const openFormModal = (
    patient: Patient | null = null, 
    prefillUnit?: 'NICU 1' | 'NICU 2' | 'SNCU', 
    prefillBed?: number,
    initialTab?: 'admission' | 'culture'
  ) => {
    if (patient) {
      setEditingPatient(patient);
      setFormName(patient.name || '');
      setFormUhid(patient.uhid || '');
      setFormDob(patient.dob || '');
      setFormAdmissionDate(patient.admissionDate || '');
      setFormUnit(patient.unit || 'NICU 1');
      setFormBedNumber(patient.bedNumber !== undefined ? patient.bedNumber : '');
      const rawType = patient.admissionType || 'Inborn';
      const normalizedType = (rawType as string) === 'Direct' ? 'Inborn' : ((rawType as string) === 'Transfer in' ? 'Outborn' : rawType);
      setFormAdmissionType(patient.unit === 'SNCU' ? 'Outborn' : normalizedType);
      setFormDiagnosis(patient.diagnosis || 'Pre Term');
      setFormStatus(patient.status || 'Admitted');
      setFormOutcomeDate(patient.outcomeDate || '');
      setFormNotes(patient.notes || '');
      
      setFormCulturePositive(patient.culturePositive || false);
      setFormCultureOrganism(patient.cultureOrganism || 'Klebsiella pneumoniae');
      setFormCultureOrganismOther(patient.cultureOrganismOther || '');
      setFormCultureSensitivity1(patient.cultureSensitivity1 || 'Amikacin');
      setFormCultureSensitivity1Pattern(patient.cultureSensitivity1Pattern || '');
      setFormCultureSensitivity2(patient.cultureSensitivity2 || 'Meropenem');
      setFormCultureSensitivity2Pattern(patient.cultureSensitivity2Pattern || '');
      setModalTab(initialTab || 'admission');
    } else {
      setEditingPatient(null);
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const localDatetime = now.toISOString().slice(0, 16);
      setFormName('');
      setFormUhid('');
      setFormDob(localDatetime);
      setFormAdmissionDate(localDatetime);
      setFormUnit(prefillUnit || 'NICU 1');
      setFormBedNumber(prefillBed !== undefined ? prefillBed : '');
      setFormAdmissionType(prefillUnit === 'SNCU' ? 'Outborn' : 'Inborn');
      setFormDiagnosis('Pre Term');
      setFormStatus('Admitted');
      setFormOutcomeDate('');
      setFormNotes('');

      setFormCulturePositive(false);
      setFormCultureOrganism('Klebsiella pneumoniae');
      setFormCultureOrganismOther('');
      setFormCultureSensitivity1('Amikacin');
      setFormCultureSensitivity1Pattern('');
      setFormCultureSensitivity2('Meropenem');
      setFormCultureSensitivity2Pattern('');
      setModalTab(initialTab || 'admission');
    }
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setModalTab('admission');
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate bed assignment for NICU 1 and NICU 2
    if ((formUnit === 'NICU 1' || formUnit === 'NICU 2') && formBedNumber === '') {
      triggerToast('Please select a bed assignment for the baby.', 'error');
      return;
    }

    setIsLoading(true);

    const payload: Omit<Patient, 'id'> = {
      name: formName,
      uhid: formUhid,
      dob: formDob,
      admissionDate: formAdmissionDate,
      unit: formUnit,
      admissionType: formUnit === 'SNCU' ? 'Outborn' : formAdmissionType,
      diagnosis: formDiagnosis,
      status: formStatus as any,
      outcomeDate: formStatus !== 'Admitted' ? formOutcomeDate : undefined,
      bedNumber: (formUnit === 'NICU 1' || formUnit === 'NICU 2') && formBedNumber !== '' ? Number(formBedNumber) : undefined,
      notes: formNotes || undefined,
      culturePositive: formCulturePositive,
      cultureOrganism: formCulturePositive ? formCultureOrganism : undefined,
      cultureOrganismOther: (formCulturePositive && formCultureOrganism === 'Other') ? formCultureOrganismOther : undefined,
      cultureSensitivity1: formCulturePositive ? formCultureSensitivity1 : undefined,
      cultureSensitivity1Pattern: formCulturePositive ? (formCultureSensitivity1Pattern || undefined) : undefined,
      cultureSensitivity2: formCulturePositive ? formCultureSensitivity2 : undefined,
      cultureSensitivity2Pattern: formCulturePositive ? (formCultureSensitivity2Pattern || undefined) : undefined
    };

    try {
      if (editingPatient?.id) {
        await updatePatient(user.uid, editingPatient.id, payload);
        triggerToast('Patient record updated successfully', 'success');
      } else {
        await addPatient(user.uid, payload);
        triggerToast('New patient added successfully', 'success');
      }
      closeFormModal();
      await fetchPatientsList();
    } catch (error) {
      console.error(error);
      triggerToast('Error saving patient record', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeletePatient = async () => {
    if (!confirmDelete?.id || !user) return;
    try {
      await deletePatient(user.uid, confirmDelete.id);
      triggerToast('Patient record deleted', 'success');
      await fetchPatientsList();
    } catch (error) {
      console.error(error);
      triggerToast('Failed to delete patient', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleShiftPatient = async (patientId: string, targetUnit: 'NICU 1' | 'NICU 2', targetBed: number) => {
    if (!user) return;
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    if (patient.unit === targetUnit && patient.bedNumber === targetBed) {
      return; // Dragged to same warmer
    }

    // Check capacity of target warmer (excluding the baby themselves)
    const activeInTarget = patients.filter(p => 
      p.status === 'Admitted' && 
      p.unit === targetUnit && 
      p.bedNumber === targetBed &&
      p.id !== patientId
    );

    if (activeInTarget.length >= 2) {
      triggerToast(`Warmer Bed ${targetBed} in ${targetUnit} is full (max 2 babies per warmer).`, 'error');
      return;
    }

    try {
      await updatePatient(user.uid, patientId, { unit: targetUnit, bedNumber: targetBed });
      triggerToast(`Shifted ${patient.name} to ${targetUnit} Bed ${targetBed}`, 'success');
      await fetchPatientsList();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to shift bed assignment', 'error');
    }
  };

  const handleAddRbs = async (patientId: string, rbsValue: number) => {
    if (!user) return;
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    try {
      const currentLog = patient.rbsLog || [];
      const updatedLog = [...currentLog, { value: rbsValue, timestamp: new Date().toISOString() }];
      await updatePatient(user.uid, patientId, { rbsLog: updatedLog });
      triggerToast(`RBS logged: ${rbsValue} mg/dL for ${patient.name}`, 'success');
      await fetchPatientsList();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to log Random Blood Sugar', 'error');
    }
  };

  // CSV Exporters
  const handleExportRegistryCSV = () => {
    const headers = [
      'Patient Name', 'UHID', 'Date of Birth', 'Admission Date', 'Unit', 'Bed Number', 
      'Admission Type', 'Diagnosis', 'Status', 'Outcome Date', 
      'Culture Positive', 'Organism', 'Drug 1 Sensitivity', 'Drug 2 Sensitivity', 
      'Clinical Notes'
    ];
    const rows = filteredPatients.map(p => [
      p.name,
      p.uhid,
      formatDate(p.dob),
      formatDate(p.admissionDate),
      p.unit,
      p.bedNumber !== undefined ? String(p.bedNumber) : '',
      p.admissionType,
      p.diagnosis,
      p.status,
      p.outcomeDate ? formatDate(p.outcomeDate) : '',
      p.culturePositive ? 'Yes' : 'No',
      p.culturePositive ? (p.cultureOrganism === 'Other' ? p.cultureOrganismOther : p.cultureOrganism) || '' : '',
      p.culturePositive && p.cultureSensitivity1 && p.cultureSensitivity1 !== 'None' ? `${p.cultureSensitivity1} (${p.cultureSensitivity1Pattern || 'N/A'})` : '',
      p.culturePositive && p.cultureSensitivity2 && p.cultureSensitivity2 !== 'None' ? `${p.cultureSensitivity2} (${p.cultureSensitivity2Pattern || 'N/A'})` : '',
      p.notes || ''
    ]);
    downloadCSV([headers, ...rows], `RIMS_NICU_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    triggerToast('Registry exported successfully', 'success');
  };

  const handleExportReportsCSV = () => {
    const headers = [
      activeReportData.isDaily ? 'Date' : 'Month',
      'Total Admissions', 'NICU Admissions', 'SNCU Admissions (Transfer)',
      'Total Deaths', 'NICU Deaths', 'SNCU Deaths',
      'Total Discharges', 'NICU Discharges', 'SNCU Discharges',
      'LAMA', 'Transfer'
    ];
    const rows = activeReportData.bucketStats.map(row => [
      row.label,
      String(row.total),
      String(row.nicuAdmissions),
      String(row.sncuTotal),
      String(row.totalDeaths),
      String(row.nicuDeaths),
      String(row.sncuDeaths),
      String(row.totalDischarge),
      String(row.nicuDischarge),
      String(row.sncuDischarge),
      String(row.lama),
      String(row.transfer)
    ]);
    downloadCSV([headers, ...rows], `RIMS_Aggregate_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    triggerToast('Report statistics exported successfully', 'success');
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#fafbfb] py-24">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4a7a7c] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#5f7475] font-medium">Checking credentials & state...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#f8fafc] flex-grow py-8 px-4 sm:px-6 lg:px-8 relative animate-fade-in text-left">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
              <span className="text-2xl drop-shadow-md">👶</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">RIMS NICU Tracker</h1>
              <div className="flex items-center text-slate-500 text-xs font-semibold space-x-2 mt-0.5">
                <span>Registry System</span>
                <span className="text-slate-300">•</span>
                {isSyncing ? (
                  <span className="flex items-center text-amber-500 gap-1">
                    <span className="w-2 h-2 border border-t-transparent border-amber-500 rounded-full animate-spin"></span>
                    Syncing
                  </span>
                ) : (
                  <span className="flex items-center text-emerald-600 font-bold gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    {isMock ? "Demo Mode (Local)" : "Live"}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap gap-1 md:gap-0 max-w-[calc(100vw-80px)] sm:max-w-none">
              <button 
                onClick={() => setActiveTab('tracker')} 
                className={`shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 active-press ${activeTab === 'tracker' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tracker Registry
              </button>
              <button 
                onClick={() => setActiveTab('bedmap')} 
                className={`shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 active-press ${activeTab === 'bedmap' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Bed Layout Map
              </button>
              <button 
                onClick={() => setActiveTab('reports')} 
                className={`shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 active-press ${activeTab === 'reports' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Analytics & Reports
              </button>
              <button 
                onClick={() => setActiveTab('calculators')} 
                className={`shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 active-press ${activeTab === 'calculators' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Clinical Calculators
              </button>
              <button 
                onClick={() => setActiveTab('cultures')} 
                className={`shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer active-press ${activeTab === 'cultures' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-rose-500" />
                Culture Registry
              </button>
            </div>
            <button 
              onClick={() => logout()} 
              className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-2xl transition-colors cursor-pointer active-press"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOCK MODE ALIGNMENT BANNER */}
        {isMock && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex gap-3 text-xs text-teal-950 items-start shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#4a7a7c] shrink-0" />
            <div>
              <strong className="text-[#3c6365] block font-bold mb-0.5">Demo Database active</strong>
              <p className="text-[#5f7475] leading-relaxed">
                You are currently running the **RIMS NICU Tracker** on local-only device memory. Create registrations, modify status parameters, delete logs, and draw analytics charts directly inside your browser. Once your Firebase environment variables are loaded, the app will securely swap to your live Google Cloud database.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: REGISTRY TRACKER */}
        {activeTab === 'tracker' && (
          <div className="space-y-8 animate-slide-up">
            
            {/* Six Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { title: 'Total Registry', count: stats.total, icon: '📋', val: 'All', grad: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/30' },
                { title: 'Admitted', count: stats.admitted, icon: '🏥', val: 'Admitted', grad: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' },
                { title: 'Discharged', count: stats.discharged, icon: '🏠', val: 'Discharged', grad: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30' },
                { title: 'Death', count: stats.died, icon: '💔', val: 'Died', grad: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/30' },
                { title: 'LAMA', count: stats.lama, icon: '⚠️', val: 'LAMA', grad: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/30' },
                { title: 'Transferred', count: stats.transferred, icon: '➡️', val: 'Transferred', grad: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/30' },
              ].map((card, idx) => (
                <div 
                  key={idx}
                  onClick={() => setFilterStatus(card.val)}
                  className={`cursor-pointer bg-white rounded-3xl p-5 border border-slate-200/50 shadow-sm transition-all duration-300 hover:-translate-y-1 ${filterStatus === card.val ? 'ring-2 ring-blue-500 shadow-md scale-[1.01]' : 'hover:shadow-md'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center text-white shadow-sm ${card.shadow}`}>
                      <span className="text-lg">{card.icon}</span>
                    </div>
                    {card.count > 0 && card.val === 'Admitted' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-500 tracking-tight">{card.title}</p>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight tabular-nums">{card.count}</h3>
                      <span className="text-xs text-slate-400 font-medium">cases</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter and Add patient bar */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96 flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search Patient Name or UHID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={handleExportRegistryCSV}
                  className="w-full sm:w-auto bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Registry CSV</span>
                </button>
                <button 
                  onClick={() => openFormModal()}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Admission</span>
                </button>
              </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                      <th className="p-4">Patient Demographics</th>
                      <th className="p-4">Admission Data</th>
                      <th className="p-4">Diagnosis</th>
                      <th className="p-4">Status & Outcomes</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {isSyncing && patients.length === 0 ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="p-4"><div className="h-8 bg-slate-100 rounded-xl w-3/4"></div></td>
                          <td className="p-4"><div className="h-8 bg-slate-100 rounded-xl w-full"></div></td>
                          <td className="p-4"><div className="h-8 bg-slate-100 rounded-xl w-1/2"></div></td>
                          <td className="p-4"><div className="h-8 bg-slate-100 rounded-xl w-2/3"></div></td>
                          <td className="p-4"><div className="h-8 bg-slate-100 rounded-xl w-1/4 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-16 text-center text-slate-500">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl mb-3 opacity-60">📭</span>
                            <p className="text-base font-bold text-slate-800">No registry records found</p>
                            <p className="text-xs text-slate-400 mt-1">Try adapting your search parameter or filter group.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map(patient => {
                        const admissionHours = calculateHoursBetween(patient.dob, patient.admissionDate);
                        const currentAgeHours = calculateHoursBetween(patient.dob, new Date().toISOString());
                        const isOutcome = patient.status !== 'Admitted';
                        const statusConfig = STATUS_OPTIONS.find(s => s.value === patient.status) || STATUS_OPTIONS[0];

                        return (
                          <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 align-top">
                              <div className="font-bold text-slate-800 text-sm">{patient.name}</div>
                              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2 items-center">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                                  #{patient.uhid}
                                </span>
                                <span>Birth: {formatDate(patient.dob)}</span>
                              </div>
                            </td>
                            <td className="p-4 align-top">
                              <div className="flex items-center space-x-1.5 mb-1">
                                <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${patient.unit === 'NICU' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
                                  {patient.unit}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200 px-2 py-0.5 rounded-full bg-slate-50">
                                  {patient.admissionType}
                                </span>
                              </div>
                              <div className="font-semibold text-slate-700">{formatDate(patient.admissionDate)}</div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Age on Admn: <span className="text-slate-600 font-semibold">{formatAgeString(admissionHours)}</span>
                              </div>
                            </td>
                            <td className="p-4 align-top">
                              <div className="flex flex-col items-start gap-1.5">
                                <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 font-bold text-xs">
                                  {patient.diagnosis}
                                </div>
                                {patient.culturePositive && (
                                  <div className="inline-flex flex-col items-start gap-0.5 px-2 py-1 rounded-md bg-rose-50/70 text-rose-700 border border-rose-100 font-bold text-[11px] w-full max-w-[220px]">
                                    <span className="flex items-center gap-1">🦠 {patient.cultureOrganism === 'Other' ? patient.cultureOrganismOther : patient.cultureOrganism}</span>
                                    {((patient.cultureSensitivity1 && patient.cultureSensitivity1 !== 'None' && patient.cultureSensitivity1Pattern) ||
                                      (patient.cultureSensitivity2 && patient.cultureSensitivity2 !== 'None' && patient.cultureSensitivity2Pattern)) && (
                                      <span className="text-[10px] font-semibold text-rose-550 border-t border-rose-100/50 pt-0.5 mt-0.5 w-full block">
                                        {[
                                          patient.cultureSensitivity1 && patient.cultureSensitivity1 !== 'None' && patient.cultureSensitivity1Pattern && `${patient.cultureSensitivity1}-${patient.cultureSensitivity1Pattern}`,
                                          patient.cultureSensitivity2 && patient.cultureSensitivity2 !== 'None' && patient.cultureSensitivity2Pattern && `${patient.cultureSensitivity2}-${patient.cultureSensitivity2Pattern}`
                                        ].filter(Boolean).join(', ')}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {patient.notes && (
                                <p className="text-xs text-slate-400 mt-1.5 max-w-[220px] line-clamp-2 leading-relaxed" title={patient.notes}>
                                  {patient.notes}
                                </p>
                              )}
                            </td>
                            <td className="p-4 align-top">
                              <div className="mb-1.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
                                  <span>{statusConfig.icon}</span>
                                  <span>{patient.status}</span>
                                </span>
                              </div>
                              {isOutcome && patient.outcomeDate ? (
                                <div className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block font-medium">
                                  Out: {formatDate(patient.outcomeDate)}
                                </div>
                              ) : (
                                <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Age: {formatAgeString(currentAgeHours)}
                                </div>
                              )}
                            </td>
                            <td className="p-4 align-middle text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button 
                                  onClick={() => openFormModal(patient)} 
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                                  title="Edit Record"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setConfirmDelete(patient)} 
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card-based list view */}
              <div className="md:hidden divide-y divide-slate-100 text-xs">
                {isSyncing && patients.length === 0 ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  ))
                ) : filteredPatients.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <span className="text-3xl mb-2 block">📭</span>
                    <p className="font-bold text-slate-800">No registry records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Adapt your search query.</p>
                  </div>
                ) : (
                  filteredPatients.map(patient => {
                    const admissionHours = calculateHoursBetween(patient.dob, patient.admissionDate);
                    const currentAgeHours = calculateHoursBetween(patient.dob, new Date().toISOString());
                    const isOutcome = patient.status !== 'Admitted';
                    const statusConfig = STATUS_OPTIONS.find(s => s.value === patient.status) || STATUS_OPTIONS[0];

                    return (
                      <div key={patient.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors text-left">
                        
                        {/* Header Demographics */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{patient.name}</h4>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-600 border border-slate-200 mt-1 inline-block">
                              #{patient.uhid}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${statusConfig.color}`}>
                              <span>{statusConfig.icon}</span>
                              <span>{statusConfig.label}</span>
                            </span>
                            
                            {isOutcome && patient.outcomeDate ? (
                              <span className="text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                Out: {formatDate(patient.outcomeDate)}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                                Age: {formatAgeString(currentAgeHours)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 block uppercase tracking-wide text-[11px] font-bold">Birth</span>
                            <span className="text-slate-700 font-semibold">{formatDate(patient.dob)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase tracking-wide text-[11px] font-bold">Admission</span>
                            <span className="text-slate-700 font-semibold">{formatDate(patient.admissionDate)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase tracking-wide text-[11px] font-bold">Location & Type</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[11px] font-black px-1.5 py-0.2 rounded ${patient.unit === 'NICU' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
                                {patient.unit}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded bg-slate-50">
                                {patient.admissionType}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase tracking-wide text-[11px] font-bold">Age on Admission</span>
                            <span className="text-slate-700 font-semibold">{formatAgeString(admissionHours)}</span>
                          </div>
                        </div>

                         {/* Diagnosis & Notes */}
                         <div className="space-y-1.5">
                           <div className="flex flex-wrap items-center gap-1.5">
                             <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-100 font-bold text-[11px]">
                               {patient.diagnosis}
                             </span>
                             {patient.culturePositive && (
                               <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-100 font-black text-[11px]" title={`Organism: ${patient.cultureOrganism === 'Other' ? patient.cultureOrganismOther : patient.cultureOrganism}`}>
                                 🦠 Positive
                               </span>
                             )}
                           </div>
                           {patient.culturePositive && (
                             <p className="text-[11px] font-bold text-rose-600 bg-rose-50/40 p-2 rounded-lg border border-rose-100/50">
                               Organism: <span className="font-extrabold">{patient.cultureOrganism === 'Other' ? patient.cultureOrganismOther : patient.cultureOrganism}</span>
                               {((patient.cultureSensitivity1 && patient.cultureSensitivity1 !== 'None' && patient.cultureSensitivity1Pattern) || 
                                 (patient.cultureSensitivity2 && patient.cultureSensitivity2 !== 'None' && patient.cultureSensitivity2Pattern)) && (
                                 <span className="block text-[10px] font-semibold text-rose-550 mt-1 border-t border-rose-100/30 pt-1">
                                   Sensitivities: {[
                                     patient.cultureSensitivity1 && patient.cultureSensitivity1 !== 'None' && patient.cultureSensitivity1Pattern && `${patient.cultureSensitivity1} (${patient.cultureSensitivity1Pattern})`,
                                     patient.cultureSensitivity2 && patient.cultureSensitivity2 !== 'None' && patient.cultureSensitivity2Pattern && `${patient.cultureSensitivity2} (${patient.cultureSensitivity2Pattern})`
                                   ].filter(Boolean).join(', ')}
                                 </span>
                               )}
                             </p>
                           )}
                           {patient.notes && (
                             <p className="text-xs text-slate-400 leading-relaxed pl-1.5 border-l-2 border-slate-200">
                               {patient.notes}
                             </p>
                           )}
                         </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                          <button
                            onClick={() => openFormModal(patient)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(patient)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                        
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & MONTHLY REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-slide-up">
            
            {/* Filter controls row */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['This Month', 'Last Month', 'All Time', 'Custom'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setReportFilterPreset(preset)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${reportFilterPreset === preset ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {reportFilterPreset === 'Custom' && (
                <div className="flex items-center space-x-2 text-xs">
                  <input 
                    type="date" 
                    value={reportDateRange.start}
                    onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none"
                  />
                  <span className="text-slate-400 font-bold">to</span>
                  <input 
                    type="date" 
                    value={reportDateRange.end}
                    onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none"
                  />
                </div>
              )}

              <button 
                onClick={handleExportReportsCSV}
                className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-5 py-2.5 rounded-2xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5 self-stretch md:self-auto cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Aggregate CSV</span>
              </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Admissions', value: activeReportData.kpis.totalAdmissions, desc: 'Registered admissions', color: 'blue' },
                { title: 'Survival Rate', value: `${activeReportData.kpis.survivalRate}%`, desc: 'Of closed outcomes', color: 'emerald' },
                { title: 'Avg Length of Stay', value: `${activeReportData.kpis.alos} days`, desc: 'Average for discharged', color: 'amber' },
                { title: 'Unit Mix', value: `${activeReportData.kpis.nicuCount} N / ${activeReportData.kpis.sncuCount} S`, desc: 'NICU vs SNCU', color: 'purple' },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/50 shadow-sm flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${kpi.color}-50 flex items-center justify-center text-xl`}>
                    {kpi.color === 'blue' && '🏥'}
                    {kpi.color === 'emerald' && '💚'}
                    {kpi.color === 'amber' && '📅'}
                    {kpi.color === 'purple' && '📊'}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                    <h4 className="text-2xl font-black text-slate-800 tabular-nums mt-0.5">{kpi.value}</h4>
                    <p className="text-xs text-slate-500 font-medium">{kpi.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Trend Chart (Col 8) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-heading font-black text-slate-800 text-base">Admissions & Discharges Trends</h3>
                    <p className="text-xs text-slate-500">Visual trend overview</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span>Admissions</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Discharges</span>
                    </div>
                  </div>
                </div>

                {trendChartData.length === 0 ? (
                  <div className="h-60 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    No active admissions logged in this report scope.
                  </div>
                ) : (
                  <div className="h-60 flex items-end justify-between space-x-2 pt-6">
                    {trendChartData.map((item, idx) => {
                      const maxVal = Math.max(1, ...trendChartData.map(d => Math.max(d.admissions, d.discharges)));
                      const admHeight = (item.admissions / maxVal) * 100;
                      const disHeight = (item.discharges / maxVal) * 100;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative min-w-[20px]">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap pointer-events-none shadow-md">
                            <span className="font-bold block border-b border-slate-800 pb-1 mb-1">{item.label}</span>
                            <span className="text-blue-300 block">Admitted: {item.admissions}</span>
                            <span className="text-emerald-300 block">Discharged: {item.discharges}</span>
                          </div>
                          
                          <div className="w-full h-44 flex items-end justify-center space-x-1.5">
                            <div 
                              className="w-1/2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm transition-all"
                              style={{ height: `${admHeight}%`, minHeight: item.admissions > 0 ? '4px' : '0' }}
                            ></div>
                            <div 
                              className="w-1/2 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-sm shadow-sm transition-all"
                              style={{ height: `${disHeight}%`, minHeight: item.discharges > 0 ? '4px' : '0' }}
                            ></div>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-2 truncate w-full text-center">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Outcomes Mix (Col 4) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6">
                <div>
                  <h3 className="font-heading font-black text-slate-800 text-base">Outcomes Distribution</h3>
                  <p className="text-xs text-slate-500">Current segment mix</p>
                </div>

                {donutChartData.length === 0 ? (
                  <div className="h-60 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    No registry outcomes found.
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {/* SVG Circular Donut Chart */}
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                        {(() => {
                          const total = donutChartData.reduce((acc, curr) => acc + curr.value, 0);
                          let cumPercent = 0;
                          return donutChartData.map((slice, index) => {
                            const percent = (slice.value / total) * 100;
                            const dashArray = `${percent} ${100 - percent}`;
                            const dashOffset = 100 - cumPercent;
                            cumPercent += percent;
                            return (
                              <circle 
                                key={index}
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth="3.5"
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                className="transition-all"
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 rounded-full m-4 shadow-sm">
                        <span className="text-2xl font-black text-slate-800">
                          {donutChartData.reduce((acc, curr) => acc + curr.value, 0)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outcomes</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="w-full grid grid-cols-2 gap-2 text-left text-[11px]">
                      {donutChartData.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                          <span className="font-semibold text-slate-600 truncate">{item.label}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* DEMOGRAPHICS & CLINICAL PROFILE ANALYSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              {/* Demographics Card */}
              <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-heading font-black text-slate-800 text-base flex items-center gap-1.5">
                    <span className="text-teal-600 text-sm">📋</span>
                    Demographics & Clinical Profile
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Demographic indices and clinical characteristics across the active registry.</p>
                </div>

                {!demographics.runnable ? (
                  <div className="flex-grow flex items-center justify-center p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl min-h-[220px]">
                    No patients logged in the database yet.
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-slate-500 font-bold">Total Infants Registered</span>
                        <strong className="text-slate-800 font-black">{demographics.total}</strong>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-black uppercase tracking-wider block">Age on Admission</span>
                        <div className="flex justify-between pl-2">
                          <span className="text-slate-500 font-medium">Mean Admission Age</span>
                          <strong className="text-slate-700 font-bold">{demographics.meanAge} h (± {demographics.sdAge} SD)</strong>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span className="text-slate-500 font-medium">&lt; 24 hours of life</span>
                          <strong className="text-slate-700 font-bold">{demographics.ageGroup1.count} ({demographics.ageGroup1.pct}%)</strong>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span className="text-slate-500 font-medium">24 - 72 hours of life</span>
                          <strong className="text-slate-700 font-bold">{demographics.ageGroup2.count} ({demographics.ageGroup2.pct}%)</strong>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span className="text-slate-500 font-medium">&gt; 72 hours of life</span>
                          <strong className="text-slate-700 font-bold">{demographics.ageGroup3.count} ({demographics.ageGroup3.pct}%)</strong>
                        </div>
                      </div>

                      <div className="space-y-1 border-t border-slate-200/60 pt-2">
                        <span className="text-slate-400 text-xs font-black uppercase tracking-wider block">Admission Source</span>
                        <div className="flex justify-between pl-2">
                          <span className="text-slate-500 font-medium">Inborn</span>
                          <strong className="text-slate-700 font-bold">
                            {demographics.admissionTypeCounts.Inborn} ({((demographics.admissionTypeCounts.Inborn / demographics.total) * 100).toFixed(1)}%)
                          </strong>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span className="text-slate-500 font-medium">Outborn</span>
                          <strong className="text-slate-700 font-bold">
                            {demographics.admissionTypeCounts.Outborn} ({((demographics.admissionTypeCounts.Outborn / demographics.total) * 100).toFixed(1)}%)
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                      <span className="text-slate-400 text-xs font-black uppercase tracking-wider block mb-2">Primary Diagnosis Profile</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {DIAGNOSIS_OPTIONS.map(dx => {
                          const count = demographics.dxCounts[dx] || 0;
                          const pct = ((count / demographics.total) * 100).toFixed(1);
                          return (
                            <div key={dx} className="bg-white border border-slate-150 rounded-xl p-2 flex flex-col justify-center items-start shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <span className="text-slate-500 font-semibold truncate w-full text-[11px] uppercase tracking-tight">{dx}</span>
                              <strong className="text-slate-800 font-extrabold text-xs mt-0.5">{count} ({pct}%)</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Outcomes Breakdown Card */}
              <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-heading font-black text-slate-800 text-base flex items-center gap-1.5">
                    <span className="text-indigo-600 text-sm">🏥</span>
                    Clinical Outcomes by Ward Unit
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Outcomes and active cases distribution compared between NICU and SNCU.</p>
                </div>

                {!demographics.runnable ? (
                  <div className="flex-grow flex items-center justify-center p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl min-h-[220px]">
                    No patients logged in the database yet.
                  </div>
                ) : (
                  <div className="space-y-4 flex-grow flex flex-col justify-between text-xs">
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex-grow flex flex-col justify-center overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold">
                            <th className="pb-2">Outcome Status</th>
                            <th className="pb-2 text-center text-blue-600 font-black">NICU (1 & 2)</th>
                            <th className="pb-2 text-center text-teal-600 font-black">SNCU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-semibold text-slate-700">
                          {STATUS_OPTIONS.map(opt => {
                            const nicuCount = demographics.outcomesByUnit.nicu[opt.value] || 0;
                            const sncuCount = demographics.outcomesByUnit.sncu[opt.value] || 0;
                            
                            const totalNicu = Object.values(demographics.outcomesByUnit.nicu).reduce((sum, v) => sum + v, 0) || 1;
                            const totalSncu = Object.values(demographics.outcomesByUnit.sncu).reduce((sum, v) => sum + v, 0) || 1;
                            
                            const nicuPct = ((nicuCount / totalNicu) * 100).toFixed(1);
                            const sncuPct = ((sncuCount / totalSncu) * 100).toFixed(1);

                            return (
                              <tr key={opt.value}>
                                <td className="py-2.5 font-bold flex items-center gap-1.5">
                                  <span className="text-xs">{opt.icon}</span>
                                  <span>{opt.label}</span>
                                </td>
                                <td className="py-2.5 text-center text-slate-800 font-black">
                                  {nicuCount} <span className="text-[11px] text-slate-400 font-normal">({nicuPct}%)</span>
                                </td>
                                <td className="py-2.5 text-center text-slate-800 font-black">
                                  {sncuCount} <span className="text-[11px] text-slate-400 font-normal">({sncuPct}%)</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MICROBIOLOGICAL & CULTURE POSITIVITY ANALYSIS */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm text-left space-y-6 animate-slide-up">
              <div>
                <h3 className="font-heading font-black text-slate-800 text-base flex items-center gap-1.5">
                  <span className="text-rose-600 text-sm">🦠</span>
                  Pathogen Culture & Sensitivity Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Microbiological analysis, pathogen distributions, and antibiotic resistance patterns.</p>
              </div>

              {!demographics.runnable || !demographics.culture || demographics.culture.positiveCount === 0 ? (
                <div className="flex items-center justify-center p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl min-h-[150px]">
                  No positive pathogen culture logs recorded in the active registry.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Column 1: Positivity Stats */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 text-xs font-black uppercase tracking-wider block">Positivity Metrics</span>
                      <div className="mt-3 space-y-2.5">
                        <div className="flex justify-between border-b border-slate-200/50 pb-1">
                          <span className="text-slate-500 font-medium">Positive Cultures</span>
                          <strong className="text-rose-600 font-black">{demographics.culture.positiveCount}</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 pb-1">
                          <span className="text-slate-500 font-medium">Registry Positivity Rate</span>
                          <strong className="text-slate-800 font-bold">
                            {((demographics.culture.positiveCount / demographics.total) * 100).toFixed(1)}%
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-150 text-xs leading-relaxed text-slate-500">
                      <strong>Clinical Alert:</strong>
                      <p className="mt-0.5 text-[11px]">
                        High culture positivity rates necessitate strict ward sanitization audits and contact precaution protocols.
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Top Pathogens Bar Chart */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-wider block">Pathogen Distribution</span>
                    <div className="space-y-2 pt-1">
                      {Object.entries(demographics.culture.pathogenCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4)
                        .map(([bug, count]) => {
                          const pct = ((count / demographics.culture.positiveCount) * 100).toFixed(0);
                          return (
                            <div key={bug} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-700 truncate max-w-[150px]">{bug}</span>
                                <span className="text-slate-500 font-bold">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Column 3: Resistance Pattern (S / I / R) */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 text-xs font-black uppercase tracking-wider block">Antibiotic Resistance (SIR)</span>
                      
                      {demographics.culture.totalSensitivityTested === 0 ? (
                        <span className="text-xs text-slate-400 italic block py-4">No drug sensitivity assays logged.</span>
                      ) : (
                        <div className="space-y-3 mt-2">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                              <span className="text-[11px] text-emerald-600 font-bold uppercase block">Sensitive</span>
                              <strong className="text-emerald-700 text-sm font-extrabold block mt-0.5">{demographics.culture.resistanceS}</strong>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                              <span className="text-[11px] text-amber-600 font-bold uppercase block">Intermed.</span>
                              <strong className="text-amber-700 text-sm font-extrabold block mt-0.5">{demographics.culture.resistanceI}</strong>
                            </div>
                            <div className="bg-rose-50 border border-rose-100 rounded-lg p-2">
                              <span className="text-[11px] text-rose-600 font-bold uppercase block">Resistant</span>
                              <strong className="text-rose-700 text-sm font-extrabold block mt-0.5">{demographics.culture.resistanceR}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {demographics.culture.totalSensitivityTested > 0 && (
                      <div className="border-t border-slate-200/50 pt-2 text-xs text-slate-500 leading-normal flex justify-between items-center">
                        <span>Overall Drug Resistance Rate:</span>
                        <strong className="text-rose-600 font-black">
                          {((demographics.culture.resistanceR / demographics.culture.totalSensitivityTested) * 100).toFixed(1)}%
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Aggregate Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-slate-800 text-base">Monthly Admissions & Outcomes Registry</h3>
                  <p className="text-xs text-slate-500">Aggregate statistics grouped chronologically</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider sticky left-0 bg-slate-50 z-10 min-w-[120px]">Period</th>
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider text-blue-700 bg-blue-50/20 font-black">Total Admn</th>
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider">NICU Admn</th>
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider bg-slate-100/50">SNCU Admn (Transfer)</th>
                      
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider text-rose-700 bg-rose-50/20 font-black">Total Deaths</th>
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider text-rose-500">NICU Deaths</th>
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider text-rose-500">SNCU Deaths</th>
                      
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider text-emerald-700 bg-emerald-50/20 font-black">Total Disch</th>
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider text-emerald-500">NICU Disch</th>
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider text-emerald-500">SNCU Disch</th>
                      
                      <th className="p-3 border-r border-slate-200 text-[11px] uppercase tracking-wider text-amber-700 font-bold">LAMA</th>
                      <th className="p-3 text-[11px] uppercase tracking-wider text-purple-700 font-bold">Transfer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReportData.bucketStats.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="p-8 text-center text-slate-400">
                          No statistics generated for this date preset.
                        </td>
                      </tr>
                    ) : (
                      activeReportData.bucketStats.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 border-r border-slate-100 font-bold text-slate-800 sticky left-0 bg-white whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                            {row.label}
                          </td>
                          <td className="p-3 border-r border-slate-100 font-black text-blue-600 bg-blue-50/10 text-center">{row.total}</td>
                          <td className="p-3 border-r border-slate-100 font-semibold text-center">{row.nicuAdmissions}</td>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/30 text-center">{row.sncuTotal}</td>
                          
                          <td className="p-3 border-r border-slate-100 font-black text-rose-600 bg-rose-50/10 text-center">{row.totalDeaths}</td>
                          <td className="p-3 border-r border-slate-100 text-rose-500 font-semibold text-center">{row.nicuDeaths}</td>
                          <td className="p-3 border-r border-slate-100 text-rose-500 font-semibold text-center">{row.sncuDeaths}</td>
                          
                          <td className="p-3 border-r border-slate-100 font-black text-emerald-600 bg-emerald-50/10 text-center">{row.totalDischarge}</td>
                          <td className="p-3 border-r border-slate-100 text-emerald-500 font-semibold text-center">{row.nicuDischarge}</td>
                          <td className="p-3 border-r border-slate-100 text-emerald-500 font-semibold text-center">{row.sncuDischarge}</td>
                          
                          <td className="p-3 border-r border-slate-100 text-amber-600 font-bold text-center">{row.lama}</td>
                          <td className="p-3 text-purple-600 font-bold text-center">{row.transfer}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'bedmap' && (
          <div className="animate-slide-up">
            <BedMapTab 
              patients={patients} 
              onAdmitPatient={(unit, bed) => openFormModal(null, unit, bed)}
              onViewPatient={(patient) => openFormModal(patient)}
              onShiftPatient={handleShiftPatient}
              onAddRbs={handleAddRbs}
            />
          </div>
        )}

        {activeTab === 'calculators' && (
          <div className="animate-slide-up">
            <CalculatorsTab />
          </div>
        )}

        {activeTab === 'cultures' && (
          <div className="animate-slide-up space-y-6">
            {/* Search and Filters panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 text-left">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span className="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center text-sm">🦠</span>
                  Pathogen Culture Logging & Sensitivity
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Track micro-biological culture positivity, identify pathogens, and configure antibiotic sensitivity patterns (S/I/R).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, UHID..."
                    value={cultureSearchQuery}
                    onChange={(e) => setCultureSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                  {(['All', 'Positive', 'Negative/Pending'] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      onClick={() => setCultureFilter(filterOpt)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        cultureFilter === filterOpt
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {filterOpt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Patients List Grid */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto text-left">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                      <th className="p-4">Patient Demographics</th>
                      <th className="p-4 text-center">Unit & Bed</th>
                      <th className="p-4 text-center">Culture Status</th>
                      <th className="p-4">Organism</th>
                      <th className="p-4">Antibiotic Sensitivities (S/I/R)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {cultureFilteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-16 text-center text-slate-500">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl mb-3 opacity-60">📭</span>
                            <p className="text-base font-bold text-slate-800">No registry records found</p>
                            <p className="text-xs text-slate-400 mt-1">Try typing a different name or changing the filter.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      cultureFilteredPatients.map(patient => (
                        <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 align-middle">
                            <div className="font-bold text-slate-800 text-sm">{patient.name}</div>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-600 border border-slate-200 mt-1 inline-block">
                              #{patient.uhid}
                            </span>
                          </td>
                          <td className="p-4 align-middle text-center">
                            <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${patient.unit === 'SNCU' ? 'bg-teal-55 text-teal-800 border border-teal-200 bg-teal-50' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                              {patient.unit}
                            </span>
                            {patient.bedNumber !== undefined && (
                              <span className="text-xs text-slate-500 font-bold ml-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                Bed {patient.bedNumber}
                              </span>
                            )}
                          </td>
                          <td className="p-4 align-middle text-center">
                            {patient.culturePositive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse-slow">
                                🦠 Positive
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-400 border border-slate-200">
                                ⚪ Negative/Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {patient.culturePositive ? (
                              <div className="font-bold text-slate-800">
                                {patient.cultureOrganism === 'Other' ? patient.cultureOrganismOther : patient.cultureOrganism}
                              </div>
                            ) : (
                              <span className="text-slate-450 italic">No pathogen growth</span>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {patient.culturePositive ? (
                              <div className="space-y-1">
                                {patient.cultureSensitivity1 && patient.cultureSensitivity1 !== 'None' && (
                                  <div className="inline-flex items-center gap-1.5 mr-2">
                                    <span className="font-semibold text-slate-700 text-xs">{patient.cultureSensitivity1}:</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[11px] font-black uppercase tracking-wider ${
                                      patient.cultureSensitivity1Pattern === 'S' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      patient.cultureSensitivity1Pattern === 'I' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                      {patient.cultureSensitivity1Pattern || 'N/A'}
                                    </span>
                                  </div>
                                )}
                                {patient.cultureSensitivity2 && patient.cultureSensitivity2 !== 'None' && (
                                  <div className="inline-flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-700 text-xs">{patient.cultureSensitivity2}:</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[11px] font-black uppercase tracking-wider ${
                                      patient.cultureSensitivity2Pattern === 'S' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      patient.cultureSensitivity2Pattern === 'I' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                      {patient.cultureSensitivity2Pattern || 'N/A'}
                                    </span>
                                  </div>
                                )}
                                {!((patient.cultureSensitivity1 && patient.cultureSensitivity1 !== 'None') || (patient.cultureSensitivity2 && patient.cultureSensitivity2 !== 'None')) && (
                                  <span className="text-slate-450 italic">No sensitivities recorded</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-450">—</span>
                            )}
                          </td>
                          <td className="p-4 align-middle text-right">
                            <button
                              onClick={() => openFormModal(patient, undefined, undefined, 'culture')}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              🧬 Log / Edit Culture
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL FORM: ADD / EDIT ADMISSION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto pt-12 pb-16 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl relative mx-4 border border-white animate-zoom-in">
            <button 
              onClick={closeFormModal} 
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full flex items-center justify-center active-press hover:scale-105 transition-all cursor-pointer"
            >
              ✕
            </button>
            
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 flex items-center tracking-tight">
                <span className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-sm text-lg">📝</span>
                {editingPatient ? 'Edit Patient Record' : 'New Admission'}
              </h2>
              <p className="text-xs text-slate-500 mt-2 ml-14 font-medium">Configure detailed clinical registration and demographic indices.</p>
            </div>

            {/* Modal Sub-tabs */}
            <div className="flex border-b border-slate-100 px-8 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setModalTab('admission')}
                className={`py-4 px-6 text-xs font-black border-b-2 transition-all cursor-pointer ${
                  modalTab === 'admission'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                📋 Demographics & Admission
              </button>
              <button
                type="button"
                onClick={() => setModalTab('culture')}
                className={`py-4 px-6 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'culture'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                🦠 Culture Positivity
                {formCulturePositive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            </div>
            
            <form onSubmit={handleSavePatient} className="p-8 space-y-6">
              {modalTab === 'admission' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Patient Name *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Baby of Clara"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">UHID *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. RIMS2026118"
                    value={formUhid}
                    onChange={(e) => setFormUhid(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Date & Time of Birth *</label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Date & Time of Admission *</label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={formAdmissionDate}
                    onChange={(e) => setFormAdmissionDate(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Unit Location</label>
                    <select 
                      value={formUnit}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setFormUnit(val);
                        if (val === 'SNCU') {
                          setFormBedNumber('');
                          setFormAdmissionType('Outborn'); // Force Outborn
                        }
                      }}
                      className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    >
                      <option value="NICU 1">NICU 1</option>
                      <option value="NICU 2">NICU 2</option>
                      <option value="SNCU">SNCU</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Admission Type
                      {formUnit === 'SNCU' && <span className="text-xs text-slate-400 font-normal ml-1.5">(Fixed for SNCU)</span>}
                    </label>
                    <select 
                      value={formAdmissionType}
                      disabled={formUnit === 'SNCU'}
                      onChange={(e) => setFormAdmissionType(e.target.value as any)}
                      className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="Inborn">Inborn</option>
                      <option value="Outborn">Outborn</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Primary Diagnosis *</label>
                    <select 
                      required
                      value={formDiagnosis}
                      onChange={(e) => setFormDiagnosis(e.target.value)}
                      className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    >
                      {DIAGNOSIS_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Current Status</label>
                    <select 
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {(formUnit === 'NICU 1' || formUnit === 'NICU 2') && (
                  <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Bed Assignment *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((bedNum) => {
                        const occupyingPatients = occupiedBedsMap[bedNum] || [];
                        const isFull = occupyingPatients.length >= 2;
                        const isShared = occupyingPatients.length === 1;
                        const isSelected = formBedNumber === bedNum;
                        
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer font-semibold';
                        if (isFull) {
                          btnStyle = 'bg-red-50/50 border-red-150 text-red-800 cursor-not-allowed opacity-75';
                        } else if (isSelected) {
                          btnStyle = 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-100 font-extrabold';
                        } else if (isShared) {
                          btnStyle = 'bg-amber-55/40 border-amber-300 text-amber-900 hover:bg-amber-100/50 cursor-pointer font-bold';
                        }
                        
                        return (
                          <button
                            key={bedNum}
                            type="button"
                            disabled={isFull}
                            onClick={() => setFormBedNumber(bedNum)}
                            className={`p-3 rounded-xl border text-left transition-all relative ${btnStyle}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-sm">Bed {bedNum}</span>
                              {isSelected && <span className="text-xs">✓</span>}
                              {isFull && <span className="text-[11px] font-black uppercase text-red-500 tracking-wider animate-pulse">Full</span>}
                              {!isFull && isShared && <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider">Shared</span>}
                            </div>
                            {occupyingPatients.length > 0 && (
                              <p className={`text-xs truncate font-medium mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                {occupyingPatients.map(p => p.name).join(', ')}
                              </p>
                            )}
                            {occupyingPatients.length === 0 && (
                              <p className={`text-xs font-medium mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                Vacant / Available
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {formBedNumber === '' && (
                      <p className="text-xs text-amber-600 font-bold mt-1">
                        ⚠️ Please assign a bed number to complete admission in {formUnit}.
                      </p>
                    )}
                  </div>
                )}

                {formStatus !== 'Admitted' && (
                  <div className="md:col-span-2 bg-amber-50 border border-amber-200 p-5 rounded-2xl origin-top">
                    <label className="block text-xs font-black text-amber-950 mb-2 uppercase tracking-wide">
                      Date & Time of Outcome ({formStatus}) *
                    </label>
                    <input 
                      required={formStatus !== 'Admitted'} 
                      type="datetime-local" 
                      value={formOutcomeDate}
                      onChange={(e) => setFormOutcomeDate(e.target.value)}
                      className="w-full bg-white border-2 border-transparent rounded-xl p-3 text-sm font-bold text-amber-950 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Clinical / Maternal Notes</label>
                  <textarea 
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter birth weight, maternal context, gestational age, APGAR scores, CPAP support, phototherapy status..." 
                    className="w-full bg-slate-100 border-2 border-transparent rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>
            )}

              {modalTab === 'culture' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Blood/CSF Culture Outcome</h4>
                        <p className="text-xs text-slate-400 font-medium">Specify if the patient has a confirmed bacterial or fungal growth.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormCulturePositive(!formCulturePositive)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          formCulturePositive ? 'bg-rose-500' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formCulturePositive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {formCulturePositive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-down">
                      {/* Organism Selection */}
                      <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">Common Organisms *</label>
                          <select
                            value={formCultureOrganism}
                            onChange={(e) => setFormCultureOrganism(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                          >
                            {COMMON_ORGANISMS.map(org => (
                              <option key={org} value={org}>{org}</option>
                            ))}
                          </select>
                        </div>

                        {formCultureOrganism === 'Other' && (
                          <div className="animate-slide-down">
                            <label className="block text-xs font-bold text-slate-700 mb-2">Specify Other Organism *</label>
                            <input
                              required={formCultureOrganism === 'Other'}
                              type="text"
                              placeholder="e.g. Serratia marcescens"
                              value={formCultureOrganismOther}
                              onChange={(e) => setFormCultureOrganismOther(e.target.value)}
                              className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-all"
                            />
                          </div>
                        )}
                      </div>

                      {/* Sensitivity 1 */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Drug 1 Sensitivity</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Antibiotic Name</label>
                              <select
                                value={formCultureSensitivity1}
                                onChange={(e) => setFormCultureSensitivity1(e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 transition-all"
                              >
                                {ANTIBIOTIC_OPTIONS.map(ab => (
                                  <option key={ab} value={ab}>{ab}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Sensitivity Pattern</label>
                              <select
                                value={formCultureSensitivity1Pattern}
                                onChange={(e) => setFormCultureSensitivity1Pattern(e.target.value as any)}
                                className="w-full bg-white border-2 border-slate-250 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                              >
                                <option value="">-- Choose Status --</option>
                                {SENSITIVITY_PATTERNS.map(pat => (
                                  <option key={pat.value} value={pat.value}>{pat.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sensitivity 2 */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Drug 2 Sensitivity</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Antibiotic Name</label>
                              <select
                                value={formCultureSensitivity2}
                                onChange={(e) => setFormCultureSensitivity2(e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 transition-all"
                              >
                                {ANTIBIOTIC_OPTIONS.map(ab => (
                                  <option key={ab} value={ab}>{ab}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Sensitivity Pattern</label>
                              <select
                                value={formCultureSensitivity2Pattern}
                                onChange={(e) => setFormCultureSensitivity2Pattern(e.target.value as any)}
                                className="w-full bg-white border-2 border-slate-250 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                              >
                                <option value="">-- Choose Status --</option>
                                {SENSITIVITY_PATTERNS.map(pat => (
                                  <option key={pat.value} value={pat.value}>{pat.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-8 flex justify-end space-x-4 border-t border-slate-100 pt-6">
                <button 
                  type="button" 
                  onClick={closeFormModal} 
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all duration-300 cursor-pointer text-xs active-press"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:shadow-lg text-white font-bold rounded-xl shadow-md transition-all duration-300 flex items-center text-xs cursor-pointer disabled:opacity-50 active-press"
                >
                  {isLoading ? 'Saving Record...' : 'Save Patient Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-white">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center ring-4 ring-red-50/50">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Delete Patient Record</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to permanently delete the neonatal record for <strong className="text-slate-800">{confirmDelete.name}</strong>? This operation will instantly sync and cannot be undone.
              </p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all duration-300 text-xs cursor-pointer active-press"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeletePatient} 
                className="flex-1 px-4 py-2.5 bg-red-650 hover:bg-red-750 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 text-xs cursor-pointer active-press"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-blue-600'} text-white px-5 py-3 rounded-2xl shadow-lg border border-white/20 backdrop-blur-md flex items-center space-x-3 animate-slide-up text-xs font-semibold`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Clinical Disclaimer Notice */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-amber-900 leading-relaxed text-left flex gap-2 items-start mt-8 shadow-sm max-w-7xl mx-auto">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>RIMS NICU Tracker Clinical Disclaimer:</strong>
          <p className="mt-0.5 text-amber-800/80">
            This dashboard registry is for record-keeping, hospital reporting, clinical audits, and statistical reporting. It is not an alarm monitor, clinical diagnosis tool, or real-time clinical logging utility. Treatment paths and clinical decisions must always follow certified hospital medical procedures and neonatal shift guidance.
          </p>
        </div>
      </div>

    </div>
  );
}
