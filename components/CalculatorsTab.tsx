'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Droplet, 
  Activity, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Percent,
  Plus
} from 'lucide-react';

// --- AAP 2022 Bilirubin Curves Nomogram Data ---
interface BiliThresholdPoint {
  hours: number;
  photoNoRisk: number;
  photoWithRisk: number;
  exchangeNoRisk: number;
  exchangeWithRisk: number;
}

const BILI_DATA_BY_GA: Record<number, BiliThresholdPoint[]> = {
  35: [
    { hours: 0, photoNoRisk: 5.0, photoWithRisk: 4.0, exchangeNoRisk: 10.0, exchangeWithRisk: 8.0 },
    { hours: 12, photoNoRisk: 9.0, photoWithRisk: 7.0, exchangeNoRisk: 14.0, exchangeWithRisk: 11.5 },
    { hours: 24, photoNoRisk: 11.2, photoWithRisk: 8.7, exchangeNoRisk: 16.5, exchangeWithRisk: 13.5 },
    { hours: 36, photoNoRisk: 12.8, photoWithRisk: 10.0, exchangeNoRisk: 18.0, exchangeWithRisk: 14.8 },
    { hours: 48, photoNoRisk: 14.0, photoWithRisk: 11.0, exchangeNoRisk: 19.0, exchangeWithRisk: 15.6 },
    { hours: 72, photoNoRisk: 15.6, photoWithRisk: 12.2, exchangeNoRisk: 21.0, exchangeWithRisk: 17.2 },
    { hours: 96, photoNoRisk: 16.5, photoWithRisk: 12.8, exchangeNoRisk: 22.0, exchangeWithRisk: 18.0 },
    { hours: 240, photoNoRisk: 17.0, photoWithRisk: 13.2, exchangeNoRisk: 22.5, exchangeWithRisk: 18.5 }
  ],
  36: [
    { hours: 0, photoNoRisk: 5.0, photoWithRisk: 4.0, exchangeNoRisk: 10.0, exchangeWithRisk: 8.0 },
    { hours: 12, photoNoRisk: 9.5, photoWithRisk: 7.4, exchangeNoRisk: 14.8, exchangeWithRisk: 12.1 },
    { hours: 24, photoNoRisk: 11.8, photoWithRisk: 9.2, exchangeNoRisk: 17.3, exchangeWithRisk: 14.2 },
    { hours: 36, photoNoRisk: 13.5, photoWithRisk: 10.5, exchangeNoRisk: 18.9, exchangeWithRisk: 15.5 },
    { hours: 48, photoNoRisk: 14.8, photoWithRisk: 11.5, exchangeNoRisk: 20.0, exchangeWithRisk: 16.4 },
    { hours: 72, photoNoRisk: 16.4, photoWithRisk: 12.8, exchangeNoRisk: 22.0, exchangeWithRisk: 18.0 },
    { hours: 96, photoNoRisk: 17.3, photoWithRisk: 13.5, exchangeNoRisk: 23.0, exchangeWithRisk: 18.8 },
    { hours: 240, photoNoRisk: 17.8, photoWithRisk: 13.9, exchangeNoRisk: 23.5, exchangeWithRisk: 19.3 }
  ],
  37: [
    { hours: 0, photoNoRisk: 5.0, photoWithRisk: 4.0, exchangeNoRisk: 10.0, exchangeWithRisk: 8.0 },
    { hours: 12, photoNoRisk: 10.0, photoWithRisk: 7.8, exchangeNoRisk: 15.6, exchangeWithRisk: 12.7 },
    { hours: 24, photoNoRisk: 12.4, photoWithRisk: 9.7, exchangeNoRisk: 18.1, exchangeWithRisk: 14.9 },
    { hours: 36, photoNoRisk: 14.2, photoWithRisk: 11.0, exchangeNoRisk: 19.8, exchangeWithRisk: 16.2 },
    { hours: 48, photoNoRisk: 15.6, photoWithRisk: 12.0, exchangeNoRisk: 21.0, exchangeWithRisk: 17.2 },
    { hours: 72, photoNoRisk: 17.2, photoWithRisk: 13.4, exchangeNoRisk: 23.0, exchangeWithRisk: 18.8 },
    { hours: 96, photoNoRisk: 18.1, photoWithRisk: 14.2, exchangeNoRisk: 24.0, exchangeWithRisk: 19.6 },
    { hours: 240, photoNoRisk: 18.6, photoWithRisk: 14.6, exchangeNoRisk: 24.5, exchangeWithRisk: 20.1 }
  ],
  38: [
    { hours: 0, photoNoRisk: 5.0, photoWithRisk: 4.0, exchangeNoRisk: 10.0, exchangeWithRisk: 8.0 },
    { hours: 12, photoNoRisk: 10.6, photoWithRisk: 8.3, exchangeNoRisk: 16.4, exchangeWithRisk: 13.4 },
    { hours: 24, photoNoRisk: 13.1, photoWithRisk: 10.2, exchangeNoRisk: 19.0, exchangeWithRisk: 15.6 },
    { hours: 36, photoNoRisk: 15.0, photoWithRisk: 11.6, exchangeNoRisk: 20.8, exchangeWithRisk: 17.0 },
    { hours: 48, photoNoRisk: 16.5, photoWithRisk: 12.7, exchangeNoRisk: 22.0, exchangeWithRisk: 18.0 },
    { hours: 72, photoNoRisk: 18.2, photoWithRisk: 14.1, exchangeNoRisk: 24.0, exchangeWithRisk: 19.6 },
    { hours: 96, photoNoRisk: 19.1, photoWithRisk: 14.9, exchangeNoRisk: 25.0, exchangeWithRisk: 20.4 },
    { hours: 240, photoNoRisk: 19.6, photoWithRisk: 15.3, exchangeNoRisk: 25.5, exchangeWithRisk: 20.9 }
  ],
  39: [
    { hours: 0, photoNoRisk: 5.0, photoWithRisk: 4.0, exchangeNoRisk: 10.0, exchangeWithRisk: 8.0 },
    { hours: 12, photoNoRisk: 11.2, photoWithRisk: 8.8, exchangeNoRisk: 17.2, exchangeWithRisk: 14.1 },
    { hours: 24, photoNoRisk: 13.8, photoWithRisk: 10.8, exchangeNoRisk: 19.9, exchangeWithRisk: 16.3 },
    { hours: 36, photoNoRisk: 15.8, photoWithRisk: 12.2, exchangeNoRisk: 21.8, exchangeWithRisk: 17.8 },
    { hours: 48, photoNoRisk: 17.3, photoWithRisk: 13.3, exchangeNoRisk: 23.0, exchangeWithRisk: 18.8 },
    { hours: 72, photoNoRisk: 19.1, photoWithRisk: 14.7, exchangeNoRisk: 25.0, exchangeWithRisk: 20.4 },
    { hours: 96, photoNoRisk: 20.0, photoWithRisk: 15.5, exchangeNoRisk: 26.0, exchangeWithRisk: 21.2 },
    { hours: 240, photoNoRisk: 20.5, photoWithRisk: 15.9, exchangeNoRisk: 26.5, exchangeWithRisk: 21.7 }
  ],
  40: [
    { hours: 0, photoNoRisk: 5.0, photoWithRisk: 4.0, exchangeNoRisk: 10.0, exchangeWithRisk: 8.0 },
    { hours: 12, photoNoRisk: 11.8, photoWithRisk: 9.3, exchangeNoRisk: 18.0, exchangeWithRisk: 14.8 },
    { hours: 24, photoNoRisk: 14.5, photoWithRisk: 11.3, exchangeNoRisk: 20.8, exchangeWithRisk: 17.0 },
    { hours: 36, photoNoRisk: 16.5, photoWithRisk: 12.8, exchangeNoRisk: 22.8, exchangeWithRisk: 18.6 },
    { hours: 48, photoNoRisk: 18.1, photoWithRisk: 13.9, exchangeNoRisk: 24.0, exchangeWithRisk: 19.6 },
    { hours: 72, photoNoRisk: 20.0, photoWithRisk: 15.3, exchangeNoRisk: 26.0, exchangeWithRisk: 21.2 },
    { hours: 96, photoNoRisk: 21.0, photoWithRisk: 16.1, exchangeNoRisk: 27.0, exchangeWithRisk: 22.0 },
    { hours: 240, photoNoRisk: 21.5, photoWithRisk: 16.5, exchangeNoRisk: 27.5, exchangeWithRisk: 22.5 }
  ]
};

function calculateThresholds(gaWeeks: number, ageHours: number, hasRisk: boolean) {
  // Bound gestational age between 35 and 40
  const ga = Math.max(35, Math.min(40, gaWeeks));
  const points = BILI_DATA_BY_GA[ga] || BILI_DATA_BY_GA[40];
  
  // Bound age in hours
  const hours = Math.max(0, Math.min(240, ageHours));

  // Find interpolation interval
  let lower = points[0];
  let upper = points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    if (hours >= points[i].hours && hours <= points[i + 1].hours) {
      lower = points[i];
      upper = points[i + 1];
      break;
    }
  }

  const range = upper.hours - lower.hours;
  const factor = range === 0 ? 0 : (hours - lower.hours) / range;

  // Interpolate phototherapy threshold
  const pLower = hasRisk ? lower.photoWithRisk : lower.photoNoRisk;
  const pUpper = hasRisk ? upper.photoWithRisk : upper.photoNoRisk;
  const phototherapy = pLower + (pUpper - pLower) * factor;

  // Interpolate exchange transfusion threshold
  const eLower = hasRisk ? lower.exchangeWithRisk : lower.exchangeNoRisk;
  const eUpper = hasRisk ? upper.exchangeWithRisk : upper.exchangeNoRisk;
  const exchange = eLower + (eUpper - eLower) * factor;

  // Escalation of care is defined as 2.0 mg/dL below Exchange Transfusion
  const escalation = Math.max(0, exchange - 2.0);

  return {
    phototherapy: parseFloat(phototherapy.toFixed(1)),
    exchange: parseFloat(exchange.toFixed(1)),
    escalation: parseFloat(escalation.toFixed(1))
  };
}

// --- Preterm Bilirubin (Maisels 2012) Guidelines Nomogram Data ---
interface PretermBiliThresholds {
  photoLower: number;     // with risk
  photoUpper: number;     // without risk
  exchangeLower: number;  // with risk
  exchangeUpper: number;  // without risk
}

const PRETERM_BILI_THRESHOLDS: Record<string, PretermBiliThresholds> = {
  '<28': { photoLower: 5.0, photoUpper: 6.0, exchangeLower: 11.0, exchangeUpper: 14.0 },
  '28-29': { photoLower: 6.0, photoUpper: 8.0, exchangeLower: 12.0, exchangeUpper: 14.0 },
  '30-31': { photoLower: 8.0, photoUpper: 10.0, exchangeLower: 13.0, exchangeUpper: 16.0 },
  '32-33': { photoLower: 10.0, photoUpper: 12.0, exchangeLower: 15.0, exchangeUpper: 18.0 },
  '34': { photoLower: 12.0, photoUpper: 14.0, exchangeLower: 17.0, exchangeUpper: 19.0 }
};

export default function CalculatorsTab() {
  const [subTab, setSubTab] = useState<'fluid' | 'bilirubin' | 'biliPreterm' | 'apgar' | 'gestational' | 'downes' | 'sa' | 'cpapinjury'>('fluid');

  // --- 1. Fluid & GIR Calculator States ---
  const [weightGrams, setWeightGrams] = useState<number>(1500);
  const [targetTfr, setTargetTfr] = useState<number>(120);
  const [enteralTfr, setEnteralTfr] = useState<number>(40);
  const [feedInterval, setFeedInterval] = useState<number>(3); // hours
  const [lipidsTfr, setLipidsTfr] = useState<number>(15); // ml/kg/day
  const [dextrosePercent, setDextrosePercent] = useState<number>(10);
  const [ivRateMlHr, setIvRateMlHr] = useState<string>(''); // Can override or calculate

  // Computed Fluids
  const weightKg = weightGrams / 1000;
  
  // Enteral volume
  const enteralVolDay = enteralTfr * weightKg;
  const volPerFeed = feedInterval === 0 ? 0 : enteralVolDay / (24 / feedInterval);

  // Lipids volume
  const lipidsVolDay = lipidsTfr * weightKg;
  const lipidsRateMlHr = lipidsVolDay / 24;

  // Calculate IV infusion to match target TFR
  // Target total fluid = Target TFR * weightKg
  const targetTotalFluidDay = targetTfr * weightKg;
  const calculatedIvFluidDay = Math.max(0, targetTotalFluidDay - enteralVolDay - lipidsVolDay);
  const calculatedIvRateMlHr = calculatedIvFluidDay / 24;

  // Use override rate if specified, otherwise calculated
  const activeIvRateMlHr = ivRateMlHr !== '' ? parseFloat(ivRateMlHr) : calculatedIvRateMlHr;
  const activeIvFluidDay = activeIvRateMlHr * 24;

  // Recompute actual deliverables
  const actualTotalFluidDay = enteralVolDay + lipidsVolDay + activeIvFluidDay;
  const actualTfr = weightKg > 0 ? actualTotalFluidDay / weightKg : 0;

  // GIR formula: (IV Fluid Rate in mL/hr * Dextrose %) / (6 * Weight in kg)
  const gir = (weightKg > 0 && activeIvRateMlHr > 0) 
    ? (activeIvRateMlHr * dextrosePercent) / (6 * weightKg)
    : 0;

  // --- 2. Bilirubin Calculator States ---
  const [gaWeeks, setGaWeeks] = useState<number>(38);
  const [ageHours, setAgeHours] = useState<number>(48);
  const [tsbValue, setTsbValue] = useState<number>(14.5);
  const [unitMode, setUnitMode] = useState<'mgdl' | 'umoll'>('mgdl');
  const [hasNeuroRisk, setHasNeuroRisk] = useState<boolean>(false);

  // convert input to mg/dL for calculations
  const tsbMgDl = useMemo(() => {
    if (unitMode === 'umoll') {
      return parseFloat((tsbValue / 17.1).toFixed(2));
    }
    return tsbValue;
  }, [tsbValue, unitMode]);

  const thresholds = useMemo(() => {
    return calculateThresholds(gaWeeks, ageHours, hasNeuroRisk);
  }, [gaWeeks, ageHours, hasNeuroRisk]);

  const biliStatus = useMemo(() => {
    if (tsbMgDl >= thresholds.exchange) {
      return { label: 'Exchange Transfusion Indicated', color: 'text-rose-700 bg-rose-50 border-rose-200', icon: '🚨', type: 'critical' };
    } else if (tsbMgDl >= thresholds.escalation) {
      return { label: 'Escalation of Care / Intensive Photo Indicated', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: '⚠️', type: 'warning' };
    } else if (tsbMgDl >= thresholds.phototherapy) {
      return { label: 'Phototherapy Indicated', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: '💡', type: 'photo' };
    } else if (tsbMgDl >= thresholds.phototherapy - 2.0) {
      return { label: 'Bilirubin Close to Threshold (Monitor closely)', color: 'text-blue-700 bg-blue-50 border-blue-100', icon: '📈', type: 'monitor' };
    }
    return { label: 'Below Phototherapy Threshold', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '✅', type: 'safe' };
  }, [tsbMgDl, thresholds]);

  // --- Preterm Bilirubin (<35 weeks) States ---
  const [pretermGaGroup, setPretermGaGroup] = useState<string>('32-33');
  const [pretermTsbValue, setPretermTsbValue] = useState<number>(9.5);
  const [pretermUnitMode, setPretermUnitMode] = useState<'mgdl' | 'umoll'>('mgdl');
  const [pretermHasRisk, setPretermHasRisk] = useState<boolean>(false);

  // convert input to mg/dL for calculations
  const pretermTsbMgDl = useMemo(() => {
    if (pretermUnitMode === 'umoll') {
      return parseFloat((pretermTsbValue / 17.1).toFixed(2));
    }
    return pretermTsbValue;
  }, [pretermTsbValue, pretermUnitMode]);

  const pretermThresholds = useMemo(() => {
    const limits = PRETERM_BILI_THRESHOLDS[pretermGaGroup] || PRETERM_BILI_THRESHOLDS['32-33'];
    const photo = pretermHasRisk ? limits.photoLower : limits.photoUpper;
    const exchange = pretermHasRisk ? limits.exchangeLower : limits.exchangeUpper;
    // escalation threshold is 2 mg/dL below exchange
    const escalation = Math.max(0, exchange - 2.0);
    return {
      phototherapy: photo,
      exchange: exchange,
      escalation: escalation
    };
  }, [pretermGaGroup, pretermHasRisk]);

  const pretermBiliStatus = useMemo(() => {
    if (pretermTsbMgDl >= pretermThresholds.exchange) {
      return { label: 'Exchange Transfusion Indicated', color: 'text-rose-700 bg-rose-50 border-rose-200', icon: '🚨', type: 'critical' };
    } else if (pretermTsbMgDl >= pretermThresholds.escalation) {
      return { label: 'Escalation of Care / Intensive Photo Indicated', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: '⚠️', type: 'warning' };
    } else if (pretermTsbMgDl >= pretermThresholds.phototherapy) {
      return { label: 'Phototherapy Indicated', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: '💡', type: 'photo' };
    } else if (pretermTsbMgDl >= pretermThresholds.phototherapy - 2.0) {
      return { label: 'Bilirubin Close to Threshold (Monitor closely)', color: 'text-blue-700 bg-blue-50 border-blue-100', icon: '📈', type: 'monitor' };
    }
    return { label: 'Below Phototherapy Threshold', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '✅', type: 'safe' };
  }, [pretermTsbMgDl, pretermThresholds]);

  // --- 3. APGAR Calculator States ---
  const [apgar, setApgar] = useState({
    appearance: 0,
    pulse: 0,
    grimace: 0,
    activity: 0,
    respiration: 0
  });

  const apgarTotal = apgar.appearance + apgar.pulse + apgar.grimace + apgar.activity + apgar.respiration;

  const apgarInterpretation = useMemo(() => {
    if (apgarTotal >= 7) return { text: 'Normal Newborn State', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Routine post-natal care support.' };
    if (apgarTotal >= 4) return { text: 'Moderately Depressed', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Needs stimulation, oxygen ventilation support, and assessment.' };
    return { text: 'Severely Depressed / Critical State', color: 'text-rose-700 bg-rose-50 border-rose-200', desc: 'Requires immediate neonatal resuscitation and active intervention.' };
  }, [apgarTotal]);

  // --- 4. Corrected Gestational Age States ---
  const [dobInput, setDobInput] = useState<string>(new Date().toISOString().slice(0, 10));
  const [gaBirthWeeks, setGaBirthWeeks] = useState<number>(32);
  const [gaBirthDays, setGaBirthDays] = useState<number>(0);
  const [targetDateInput, setTargetDateInput] = useState<string>(new Date().toISOString().slice(0, 10));

  const ageCalculation = useMemo(() => {
    const dob = new Date(dobInput);
    const target = new Date(targetDateInput);
    if (isNaN(dob.getTime()) || isNaN(target.getTime())) return null;

    const diffTime = target.getTime() - dob.getTime();
    const diffDaysTotal = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDaysTotal < 0) return null;

    const chronWeeks = Math.floor(diffDaysTotal / 7);
    const chronDays = diffDaysTotal % 7;

    // Gestational age at birth in total days
    const birthGaDays = gaBirthWeeks * 7 + gaBirthDays;
    
    // Term is 40 weeks (280 days)
    const weeksPreterm = Math.max(0, 40 - gaBirthWeeks - (gaBirthDays / 7));
    const daysPreterm = Math.max(0, 280 - birthGaDays);

    // Corrected GA in total days = Birth GA days + Chronological days
    const correctedGaDaysTotal = birthGaDays + diffDaysTotal;
    const correctedWeeks = Math.floor(correctedGaDaysTotal / 7);
    const correctedDays = correctedGaDaysTotal % 7;

    // Corrected Age in weeks/days (if baby has crossed 40 weeks gestational age)
    const correctedAgeWeeksTotal = Math.floor((diffDaysTotal - daysPreterm) / 7);
    const correctedAgeDays = (diffDaysTotal - daysPreterm) % 7;

    return {
      chronologicalWeeks: chronWeeks,
      chronologicalDays: chronDays,
      weeksPreterm: parseFloat(weeksPreterm.toFixed(1)),
      correctedGaWeeks: correctedWeeks,
      correctedGaDays: correctedDays,
      isPreterm: weeksPreterm > 0,
      correctedAgeWeeks: correctedAgeWeeksTotal >= 0 ? correctedAgeWeeksTotal : null,
      correctedAgeDays: correctedAgeWeeksTotal >= 0 ? correctedAgeDays : null
    };
  }, [dobInput, gaBirthWeeks, gaBirthDays, targetDateInput]);
 
  // --- 5. Downes Score States ---
  const [downes, setDownes] = useState({
    rr: 0,
    cyanosis: 0,
    retractions: 0,
    grunting: 0,
    airEntry: 0
  });

  const downesTotal = downes.rr + downes.cyanosis + downes.retractions + downes.grunting + downes.airEntry;

  const downesInterpretation = useMemo(() => {
    if (downesTotal >= 6) return { text: 'Severe Distress / Impending Failure', color: 'text-rose-700 bg-rose-50 border-rose-200', desc: 'Medical emergency. Impending respiratory failure. Immediate neonatal resuscitation, intensive monitoring, and mechanical ventilation/intubation should be considered.' };
    if (downesTotal >= 4) return { text: 'Moderate Respiratory Distress', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Requires active intervention. Oxygen therapy or non-invasive respiratory support (nasal CPAP) should be initiated and monitored closely.' };
    return { text: 'Mild Respiratory Distress', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Clinically stable. Provide supplemental oxygen or simple observation as indicated.' };
  }, [downesTotal]);

  // --- 6. Silverman-Andersen (SA) Score States ---
  const [sa, setSa] = useState({
    upperChest: 0,
    lowerChest: 0,
    xiphoid: 0,
    nares: 0,
    grunt: 0
  });

  const saTotal = sa.upperChest + sa.lowerChest + sa.xiphoid + sa.nares + sa.grunt;

  const saInterpretation = useMemo(() => {
    if (saTotal >= 7) return { text: 'Severe Respiratory Distress', color: 'text-rose-700 bg-rose-50 border-rose-200', desc: 'Critical state. Marked retractions, grunting, and seesaw breathing. Prompt clinical support, oxygen, CPAP, or mechanical ventilation is indicated.' };
    if (saTotal >= 4) return { text: 'Moderate Distress', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Significant respiratory effort observed. Non-invasive respiratory support (nCPAP) or high-flow oxygen should be considered.' };
    if (saTotal >= 1) return { text: 'Mild Distress', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Minor distress signs. Observe closely. Can be normal during early transitional hours.' };
    return { text: 'No Respiratory Distress', color: 'text-emerald-800 bg-emerald-50 border-emerald-100', desc: 'Normal respiratory status. Synchronized respiration with no retraction signs.' };
  }, [saTotal]);

  // --- 7. Nasal CPAP Injury States ---
  const [cpapInjury, setCpapInjury] = useState({
    bridge: 0,
    septum: 0,
    columella: 0,
    leftNostril: 0,
    rightNostril: 0
  });

  const maxInjuryStage = Math.max(
    cpapInjury.bridge,
    cpapInjury.septum,
    cpapInjury.columella,
    cpapInjury.leftNostril,
    cpapInjury.rightNostril
  );

  const cpapInjuryTotal = 
    cpapInjury.bridge + 
    cpapInjury.septum + 
    cpapInjury.columella + 
    cpapInjury.leftNostril + 
    cpapInjury.rightNostril;

  const injuryInterpretation = useMemo(() => {
    switch (maxInjuryStage) {
      case 3:
        return {
          stage: 'Stage III (Severe Trauma / Necrosis)',
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          recommendation: 'Deep tissue erosion or necrosis observed (blackened tissue). CEASE direct pressure interfaces immediately. Swap to high-flow nasal cannula (HFNC) or alternative oxygenation methods. Consult wound specialist and notify physician. Implement active wound care protocols.'
        };
      case 2:
        return {
          stage: 'Stage II (Moderate Trauma / Abrasion)',
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          recommendation: 'Superficial skin breakdown, abrasion, or epidermal loss. Alternating interfaces (mask to prongs) every 8-12 hours is mandatory. Apply protective barrier dressings (hydrocolloid). Adjust strapping tension. Inspect fitting size immediately.'
        };
      case 1:
        return {
          stage: 'Stage I (Mild Trauma / Erythema)',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          recommendation: 'Persistent non-blanchable redness (erythema). Apply thin hydrocolloid barrier dressing. Rotate interface styles periodically. Ensure correct interface alignment and verify prongs do not make tight contact with septum.'
        };
      default:
        return {
          stage: 'Stage 0 (No Nasal Trauma)',
          color: 'text-emerald-800 bg-emerald-50 border-emerald-100',
          recommendation: 'Normal nasal mucosa. Perform routine skin assessment every 4 hours. Keep interface clean, dry, and ensure correct size alignment.'
        };
    }
  }, [maxInjuryStage]);

  return (
    <div className="space-y-8">
      {/* Sub Tabs Selection Header */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap gap-1.5 max-w-full">
        {[
          { id: 'fluid', label: 'Fluid & GIR', icon: Droplet },
          { id: 'bilirubin', label: 'Bilirubin (AAP 2022)', icon: TrendingUp },
          { id: 'biliPreterm', label: 'Preterm Bili (<35w)', icon: TrendingUp },
          { id: 'apgar', label: 'APGAR Score', icon: Activity },
          { id: 'gestational', label: 'GA & Corrected Age', icon: Calendar },
          { id: 'downes', label: 'Downes Score', icon: Activity },
          { id: 'sa', label: 'SA Score', icon: Activity },
          { id: 'cpapinjury', label: 'Nasal CPAP Injury', icon: AlertCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active-press ${subTab === tab.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CALCULATOR CONTAINER */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden text-left p-6 md:p-8">
        
        {/* --- TAB 1: TOTAL FLUID & GIR CALCULATOR --- */}
        {subTab === 'fluid' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm">💧</span>
                Neonatal Fluid & GIR Calculator
              </h2>
              <p className="text-xs text-slate-500 mt-1">Calculate infant enteral and parenteral fluid rates, volumes, and Glucose Infusion Rates (GIR) dynamically.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Inputs Panel (Col 5) */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/50 space-y-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Input Variables</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Baby Weight (grams)</label>
                  <input
                    type="number"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(Math.max(100, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Fluid Intake (mL/kg/day)</label>
                  <input
                    type="number"
                    value={targetTfr}
                    onChange={(e) => setTargetTfr(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="border-t border-slate-200/80 pt-4 space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enteral Feeds</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Feeds (mL/kg/day)</label>
                      <input
                        type="number"
                        value={enteralTfr}
                        onChange={(e) => setEnteralTfr(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Interval (hours)</label>
                      <select
                        value={feedInterval}
                        onChange={(e) => setFeedInterval(parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                      >
                        <option value={2}>Every 2 hrs (q2h)</option>
                        <option value={3}>Every 3 hrs (q3h)</option>
                        <option value={4}>Every 4 hrs (q4h)</option>
                        <option value={0}>Continuous Feed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-4 space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">IV Fluids & Dextrose</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Lipids (mL/kg/day)</label>
                      <input
                        type="number"
                        value={lipidsTfr}
                        onChange={(e) => setLipidsTfr(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Dextrose %</label>
                      <input
                        type="number"
                        step="0.5"
                        value={dextrosePercent}
                        onChange={(e) => setDextrosePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Manual IV Infusion Rate (mL/hr) <span className="text-slate-400 font-normal">(Optional Override)</span></label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder={`Calculated: ${calculatedIvRateMlHr.toFixed(1)}`}
                      value={ivRateMlHr}
                      onChange={(e) => setIvRateMlHr(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Outputs Summary (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Calculated Distribution</h3>

                {/* Main KPIs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider block mb-2">Total Fluid Rate</span>
                    <div>
                      <h4 className="text-3xl font-black text-blue-800 tracking-tight tabular-nums">{actualTfr.toFixed(1)}</h4>
                      <span className="text-[10px] text-blue-600 font-bold block mt-1">mL/kg/day</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col justify-between">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-2">Glucose Infusion Rate (GIR)</span>
                    <div>
                      <h4 className="text-3xl font-black text-indigo-800 tracking-tight tabular-nums">{gir.toFixed(2)}</h4>
                      <span className="text-[10px] text-indigo-600 font-bold block mt-1">mg/kg/min</span>
                    </div>
                  </div>
                </div>

                {/* detailed breakdown table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-600">
                    Fluid Volume Details (For {weightKg.toFixed(3)} kg Baby)
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    
                    <div className="px-4 py-3.5 flex justify-between items-center hover:bg-slate-50/30 transition-colors">
                      <div>
                        <span className="font-bold text-slate-800 block">Enteral Intake (Milk/Formula)</span>
                        <span className="text-[10px] text-slate-400">TFR: {enteralTfr} mL/kg/day</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 text-sm">{enteralVolDay.toFixed(1)} mL/day</span>
                        <span className="text-[10px] text-slate-500 block font-semibold mt-0.5">
                          {feedInterval === 0 ? 'Continuous' : `${volPerFeed.toFixed(1)} mL q${feedInterval}h`}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-3.5 flex justify-between items-center hover:bg-slate-50/30 transition-colors">
                      <div>
                        <span className="font-bold text-slate-800 block">Lipid Infusion (e.g. 20%)</span>
                        <span className="text-[10px] text-slate-400">TFR: {lipidsTfr} mL/kg/day</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 text-sm">{lipidsVolDay.toFixed(1)} mL/day</span>
                        <span className="text-[10px] text-slate-500 block font-semibold mt-0.5">{lipidsRateMlHr.toFixed(2)} mL/hr</span>
                      </div>
                    </div>

                    <div className="px-4 py-3.5 flex justify-between items-center hover:bg-slate-50/30 transition-colors">
                      <div>
                        <span className="font-bold text-slate-800 block">IV Dextrose Fluid</span>
                        <span className="text-[10px] text-slate-400">
                          {ivRateMlHr !== '' ? 'Manual Overridden Rate' : `Calculated matching TFR: ${calculatedIvFluidDay.toFixed(0)} mL/day`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 text-sm">{activeIvFluidDay.toFixed(1)} mL/day</span>
                        <span className="text-[10px] text-blue-600 block font-black mt-0.5">{activeIvRateMlHr.toFixed(1)} mL/hr</span>
                      </div>
                    </div>

                    <div className="px-4 py-4 bg-slate-50/50 flex justify-between items-center font-bold">
                      <span className="text-slate-800 text-sm">Total Fluid Volume delivered</span>
                      <span className="text-slate-900 text-sm font-extrabold">{actualTotalFluidDay.toFixed(1)} mL/day</span>
                    </div>

                  </div>
                </div>

                {/* GIR guide note */}
                <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl text-[10px] text-slate-500 leading-relaxed text-left flex gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <strong>Glucose Infusion Rate (GIR) Clinical Notes:</strong>
                    <p className="mt-0.5">
                      Normal target GIR for stable neonates is typically between 4 - 8 mg/kg/min (up to 12 mg/kg/min for preterm babies). Very low GIR rates may lead to hypoglycemia, whereas excessively high rates can trigger hyperglycemia and lipogenesis.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: AAP 2022 BILIRUBIN nomogram CALCULATOR --- */}
        {subTab === 'bilirubin' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-9 h-9 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-sm">💡</span>
                AAP 2022 Hyperbilirubinemia Guidelines
              </h2>
              <p className="text-xs text-slate-500 mt-1">Determine phototherapy, escalation of care, and exchange transfusion thresholds in newborns &ge;35 weeks.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Inputs Panel (Col 5) */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/50 space-y-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Patient Index</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Gestational Age</label>
                    <select
                      value={gaWeeks}
                      onChange={(e) => setGaWeeks(parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value={35}>35 Weeks</option>
                      <option value={36}>36 Weeks</option>
                      <option value={37}>37 Weeks</option>
                      <option value={38}>38 Weeks</option>
                      <option value={39}>39 Weeks</option>
                      <option value={40}>40+ Weeks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Age in Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={ageHours}
                      onChange={(e) => setAgeHours(Math.max(0, Math.min(240, parseInt(e.target.value) || 0)))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Serum Bilirubin (TSB)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={tsbValue}
                      onChange={(e) => setTsbValue(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                    />
                    <select
                      value={unitMode}
                      onChange={(e) => setUnitMode(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="mgdl">mg/dL</option>
                      <option value="umoll">μmol/L</option>
                    </select>
                  </div>
                  {unitMode === 'umoll' && (
                    <span className="text-[10px] text-slate-400 font-medium">Mapped to: {tsbMgDl.toFixed(1)} mg/dL</span>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Neurotoxicity Risk Factors</h4>
                  <label className="flex items-start space-x-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200/50 hover:bg-slate-100/30 transition-all">
                    <input
                      type="checkbox"
                      checked={hasNeuroRisk}
                      onChange={(e) => setHasNeuroRisk(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div className="text-xs leading-relaxed text-slate-600">
                      <strong className="font-bold text-slate-700 block">Risk Factors Present</strong>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        Rh/ABO isoimmune hemolytic disease, G6PD deficiency, sepsis, acidosis, clinical instability, or albumin &lt; 3.0 g/dL.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Outputs Summary (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Result Recommendation Alert */}
                <div className={`p-5 rounded-2xl border-2 flex gap-3 text-xs leading-relaxed ${biliStatus.color} animate-fade-in`}>
                  <span className="text-2xl shrink-0">{biliStatus.icon}</span>
                  <div>
                    <h4 className="font-black text-sm tracking-tight">{biliStatus.label}</h4>
                    <p className="mt-1 font-medium text-[11px] leading-relaxed opacity-90">
                      {biliStatus.type === 'safe' && `TSB is below the phototherapy threshold of ${thresholds.phototherapy} mg/dL.`}
                      {biliStatus.type === 'monitor' && `TSB (${tsbMgDl.toFixed(1)} mg/dL) is close to the phototherapy threshold of ${thresholds.phototherapy} mg/dL. Monitor levels closely.`}
                      {biliStatus.type === 'photo' && `TSB is at or above the phototherapy threshold of ${thresholds.phototherapy} mg/dL. Intensive phototherapy is recommended.`}
                      {biliStatus.type === 'warning' && `TSB (${tsbMgDl.toFixed(1)} mg/dL) is within 2 mg/dL of the exchange threshold (${thresholds.exchange} mg/dL). Initiate intensive phototherapy immediately and prepare for escalation of care.`}
                      {biliStatus.type === 'critical' && `TSB is at or above the exchange transfusion threshold of ${thresholds.exchange} mg/dL. Critical emergency intervention is indicated.`}
                    </p>
                  </div>
                </div>

                {/* Threshold values card */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Phototherapy</span>
                    <strong className="text-lg font-black text-slate-700 block mt-1">{thresholds.phototherapy}</strong>
                    <span className="text-[9px] text-slate-400 font-semibold">mg/dL</span>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-orange-600 font-bold block uppercase tracking-wide">Escalation Limit</span>
                    <strong className="text-lg font-black text-orange-700 block mt-1">{thresholds.escalation}</strong>
                    <span className="text-[9px] text-orange-400 font-semibold">mg/dL</span>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-rose-600 font-bold block uppercase tracking-wide">Exchange Limit</span>
                    <strong className="text-lg font-black text-rose-700 block mt-1">{thresholds.exchange}</strong>
                    <span className="text-[9px] text-rose-400 font-semibold">mg/dL</span>
                  </div>
                </div>

                {/* Linear Gauge Visualizer */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TSB Relative Indicator</h4>
                  
                  {/* Gauge bar */}
                  <div className="relative pt-6 pb-2">
                    <div className="absolute top-0 inset-x-0 text-[10px] font-bold text-slate-400 h-4">
                      <span className="absolute left-0">0 mg/dL</span>
                      <span className="absolute transform -translate-x-1/2" style={{ left: '45%' }}>Photo ({thresholds.phototherapy})</span>
                      <span className="absolute transform -translate-x-1/2" style={{ left: '80%' }}>Exchange ({thresholds.exchange})</span>
                    </div>

                    {/* Multi-segmented progress track */}
                    <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-100 mt-1">
                      {/* Safe segment (green) - represents up to phototherapy threshold */}
                      <div className="bg-emerald-400" style={{ width: '45%' }}></div>
                      {/* Photo segment (yellow) - represents photo to escalation limit */}
                      <div className="bg-amber-300" style={{ width: '25%' }}></div>
                      {/* Escalation segment (orange) - represents escalation to exchange */}
                      <div className="bg-orange-400" style={{ width: '10%' }}></div>
                      {/* Critical segment (red) - above exchange */}
                      <div className="bg-rose-500" style={{ width: '20%' }}></div>
                    </div>

                    {/* Current Bilirubin pin indicator */}
                    {(() => {
                      // Calculate pin percentage positioning
                      // We map: TSB 0 = 0%, TSB thresholds.phototherapy = 45%, TSB thresholds.exchange = 80%, Max (e.g. thresholds.exchange * 1.3) = 100%
                      let percent = 0;
                      if (tsbMgDl <= thresholds.phototherapy) {
                        percent = (tsbMgDl / (thresholds.phototherapy || 1)) * 45;
                      } else if (tsbMgDl <= thresholds.exchange) {
                        const range = thresholds.exchange - thresholds.phototherapy;
                        const factor = range === 0 ? 0 : (tsbMgDl - thresholds.phototherapy) / range;
                        percent = 45 + factor * 35; // 45% to 80%
                      } else {
                        const overLimit = tsbMgDl - thresholds.exchange;
                        const scale = thresholds.exchange * 0.3; // max visual buffer is 30% over exchange
                        const factor = Math.min(1, overLimit / scale);
                        percent = 80 + factor * 20; // 80% to 100%
                      }
                      
                      return (
                        <div 
                          className="absolute bottom-1.5 flex flex-col items-center transform -translate-x-1/2 transition-all duration-300 z-10"
                          style={{ left: `${Math.max(2, Math.min(98, percent))}%` }}
                        >
                          <span className="bg-slate-800 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                            TSB: {tsbMgDl.toFixed(1)}
                          </span>
                          <div className="w-1.5 h-3 bg-slate-800 mt-0.5 clip-triangle"></div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Legal disclaimer */}
                  <span className="text-[9px] text-slate-400 italic leading-snug block">
                    * Nomogram curves are derived from the American Academy of Pediatrics (AAP) 2022 Guidelines. Recommendations are for decision-support reference only.
                  </span>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2B: PRETERM BILIRUBIN NOMOGRAM CALCULATOR (<35 WEEKS) --- */}
        {subTab === 'biliPreterm' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-9 h-9 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-sm">💡</span>
                Preterm Hyperbilirubinemia Guidelines (&lt;35 Weeks)
              </h2>
              <p className="text-xs text-slate-500 mt-1">Determine consensus-based phototherapy, escalation of care, and exchange transfusion thresholds in infants &lt;35 weeks (Maisels et al. 2012).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Inputs Panel (Col 5) */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/50 space-y-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Patient Index</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Gestational Age at Birth</label>
                    <select
                      value={pretermGaGroup}
                      onChange={(e) => setPretermGaGroup(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="<28">&lt; 28 Weeks</option>
                      <option value="28-29">28 Weeks to 29 Weeks 6/7</option>
                      <option value="30-31">30 Weeks to 31 Weeks 6/7</option>
                      <option value="32-33">32 Weeks to 33 Weeks 6/7</option>
                      <option value="34">34 Weeks to 34 Weeks 6/7</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Serum Bilirubin (TSB)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={pretermTsbValue}
                      onChange={(e) => setPretermTsbValue(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                    />
                    <select
                      value={pretermUnitMode}
                      onChange={(e) => setPretermUnitMode(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="mgdl">mg/dL</option>
                      <option value="umoll">μmol/L</option>
                    </select>
                  </div>
                  {pretermUnitMode === 'umoll' && (
                    <span className="text-[10px] text-slate-400 font-medium">Mapped to: {pretermTsbMgDl.toFixed(1)} mg/dL</span>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Neurotoxicity Risk Factors</h4>
                  <label className="flex items-start space-x-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200/50 hover:bg-slate-100/30 transition-all">
                    <input
                      type="checkbox"
                      checked={pretermHasRisk}
                      onChange={(e) => setPretermHasRisk(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div className="text-xs leading-relaxed text-slate-600">
                      <strong className="font-bold text-slate-700 block">Risk Factors Present</strong>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        Hemolytic disease (Rh/ABO isoimmune disease, G6PD deficiency), clinical instability (sepsis, acidosis, temperature instability, significant respiratory distress, perinatal depression), or albumin &lt; 2.5 g/dL.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Outputs Summary (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Result Recommendation Alert */}
                <div className={`p-5 rounded-2xl border-2 flex gap-3 text-xs leading-relaxed ${pretermBiliStatus.color} animate-fade-in`}>
                  <span className="text-2xl shrink-0">{pretermBiliStatus.icon}</span>
                  <div>
                    <h4 className="font-black text-sm tracking-tight">{pretermBiliStatus.label}</h4>
                    <p className="mt-1 font-medium text-[11px] leading-relaxed opacity-90">
                      {pretermBiliStatus.type === 'safe' && `TSB is below the phototherapy threshold of ${pretermThresholds.phototherapy} mg/dL.`}
                      {pretermBiliStatus.type === 'monitor' && `TSB (${pretermTsbMgDl.toFixed(1)} mg/dL) is close to the phototherapy threshold of ${pretermThresholds.phototherapy} mg/dL. Monitor levels closely.`}
                      {pretermBiliStatus.type === 'photo' && `TSB is at or above the phototherapy threshold of ${pretermThresholds.phototherapy} mg/dL. Intensive phototherapy is recommended.`}
                      {pretermBiliStatus.type === 'warning' && `TSB (${pretermTsbMgDl.toFixed(1)} mg/dL) is within 2 mg/dL of the exchange threshold (${pretermThresholds.exchange} mg/dL). Initiate intensive phototherapy immediately and prepare for escalation of care.`}
                      {pretermBiliStatus.type === 'critical' && `TSB is at or above the exchange transfusion threshold of ${pretermThresholds.exchange} mg/dL. Critical emergency intervention is indicated.`}
                    </p>
                  </div>
                </div>

                {/* Threshold values card */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Phototherapy</span>
                    <strong className="text-lg font-black text-slate-700 block mt-1">{pretermThresholds.phototherapy}</strong>
                    <span className="text-[9px] text-slate-400 font-semibold">mg/dL</span>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-orange-600 font-bold block uppercase tracking-wide">Escalation Limit</span>
                    <strong className="text-lg font-black text-orange-700 block mt-1">{pretermThresholds.escalation}</strong>
                    <span className="text-[9px] text-orange-400 font-semibold">mg/dL</span>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-rose-600 font-bold block uppercase tracking-wide">Exchange Limit</span>
                    <strong className="text-lg font-black text-rose-700 block mt-1">{pretermThresholds.exchange}</strong>
                    <span className="text-[9px] text-rose-400 font-semibold">mg/dL</span>
                  </div>
                </div>

                {/* Linear Gauge Visualizer */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TSB Relative Indicator</h4>
                  
                  {/* Gauge bar */}
                  <div className="relative pt-6 pb-2">
                    <div className="absolute top-0 inset-x-0 text-[10px] font-bold text-slate-400 h-4">
                      <span className="absolute left-0">0 mg/dL</span>
                      <span className="absolute transform -translate-x-1/2" style={{ left: '45%' }}>Photo ({pretermThresholds.phototherapy})</span>
                      <span className="absolute transform -translate-x-1/2" style={{ left: '80%' }}>Exchange ({pretermThresholds.exchange})</span>
                    </div>

                    {/* Multi-segmented progress track */}
                    <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-100 mt-1">
                      {/* Safe segment (green) - represents up to phototherapy threshold */}
                      <div className="bg-emerald-400" style={{ width: '45%' }}></div>
                      {/* Photo segment (yellow) - represents photo to escalation limit */}
                      <div className="bg-amber-300" style={{ width: '25%' }}></div>
                      {/* Escalation segment (orange) - represents escalation to exchange */}
                      <div className="bg-orange-400" style={{ width: '10%' }}></div>
                      {/* Critical segment (red) - above exchange */}
                      <div className="bg-rose-500" style={{ width: '20%' }}></div>
                    </div>

                    {/* Current Bilirubin pin indicator */}
                    {(() => {
                      let percent = 0;
                      if (pretermTsbMgDl <= pretermThresholds.phototherapy) {
                        percent = (pretermTsbMgDl / (pretermThresholds.phototherapy || 1)) * 45;
                      } else if (pretermTsbMgDl <= pretermThresholds.exchange) {
                        const range = pretermThresholds.exchange - pretermThresholds.phototherapy;
                        const factor = range === 0 ? 0 : (pretermTsbMgDl - pretermThresholds.phototherapy) / range;
                        percent = 45 + factor * 35; // 45% to 80%
                      } else {
                        const overLimit = pretermTsbMgDl - pretermThresholds.exchange;
                        const scale = pretermThresholds.exchange * 0.3; // max visual buffer is 30% over exchange
                        const factor = Math.min(1, overLimit / scale);
                        percent = 80 + factor * 20; // 80% to 100%
                      }
                      
                      return (
                        <div 
                          className="absolute bottom-1.5 flex flex-col items-center transform -translate-x-1/2 transition-all duration-300 z-10"
                          style={{ left: `${Math.max(2, Math.min(98, percent))}%` }}
                        >
                          <span className="bg-slate-800 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                            TSB: {pretermTsbMgDl.toFixed(1)}
                          </span>
                          <div className="w-1.5 h-3 bg-slate-800 mt-0.5 clip-triangle"></div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Legal disclaimer */}
                  <span className="text-[9px] text-slate-400 italic leading-snug block">
                    * Threshold values are derived from the Maisels et al. (2012) Preterm Hyperbilirubinemia Consensus Guidelines. Operational decisions should always depend on clinical correlation and institutional protocol.
                  </span>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: APGAR SCORE CALCULATOR --- */}
        {subTab === 'apgar' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center text-sm">❤️</span>
                Newborn APGAR Score Calculator
              </h2>
              <p className="text-xs text-slate-500 mt-1">Determine newborn health metrics at 1, 5, and 10 minutes post-delivery based on the 5 physical indices.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Questionnaire Grid (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {[
                  {
                    key: 'appearance',
                    label: 'Appearance (Skin Color)',
                    options: [
                      { score: 0, text: 'Blue-gray, pale all over' },
                      { score: 1, text: 'Body pink, extremities blue (Acrocyanosis)' },
                      { score: 2, text: 'Completely pink' }
                    ]
                  },
                  {
                    key: 'pulse',
                    label: 'Pulse (Heart Rate)',
                    options: [
                      { score: 0, text: 'Absent pulse' },
                      { score: 1, text: 'Slow (< 100 beats per minute)' },
                      { score: 2, text: 'Normal (≥ 100 beats per minute)' }
                    ]
                  },
                  {
                    key: 'grimace',
                    label: 'Grimace (Reflex Irritability)',
                    options: [
                      { score: 0, text: 'No response to stimulation' },
                      { score: 1, text: 'Grimace or weak cry on stimulation' },
                      { score: 2, text: 'Vigorous cry, sneeze, pull away' }
                    ]
                  },
                  {
                    key: 'activity',
                    label: 'Activity (Muscle Tone)',
                    options: [
                      { score: 0, text: 'Flaccid, limp muscles' },
                      { score: 1, text: 'Some flexion of arms and legs' },
                      { score: 2, text: 'Active motion, vigorous flexion' }
                    ]
                  },
                  {
                    key: 'respiration',
                    label: 'Respiration (Breathing)',
                    options: [
                      { score: 0, text: 'Absent breathing' },
                      { score: 1, text: 'Slow, irregular, weak cry' },
                      { score: 2, text: 'Good strong cry, vigorous breathing' }
                    ]
                  }
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{item.label}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {item.options.map((opt) => {
                        const isActive = apgar[item.key as keyof typeof apgar] === opt.score;
                        return (
                          <button
                            key={opt.score}
                            type="button"
                            onClick={() => setApgar(prev => ({ ...prev, [item.key]: opt.score }))}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold'}`}
                          >
                            <span className="block text-sm font-black mb-0.5">{opt.score} Point{opt.score !== 1 ? 's' : ''}</span>
                            <span className="text-[10px] leading-tight block opacity-90">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Score summary panel (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">APGAR Output</h3>

                {/* Main Score Block */}
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-center space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total APGAR Score</span>
                  
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="54" fill="transparent" stroke="#e2ecec" strokeWidth="8" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        fill="transparent" 
                        stroke={apgarTotal >= 7 ? '#10b981' : apgarTotal >= 4 ? '#f59e0b' : '#ef4444'} 
                        strokeWidth="8" 
                        strokeDasharray={`${(apgarTotal / 10) * 339.29} 339.29`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-800 tracking-tight tabular-nums">{apgarTotal}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">out of 10</span>
                    </div>
                  </div>

                  {/* Recommendation Alert Box */}
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed text-left space-y-1 ${apgarInterpretation.color}`}>
                    <strong className="font-bold block">{apgarInterpretation.text}</strong>
                    <p className="text-[10px] opacity-90 leading-relaxed">{apgarInterpretation.desc}</p>
                  </div>
                </div>

                {/* Score scale reference */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs text-slate-500 space-y-3">
                  <h4 className="font-bold text-slate-600">Score Scale Reference:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span><strong>7 to 10</strong>: Normal/Excellent health status.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span><strong>4 to 6</strong>: Moderately depressed; requires monitoring/airway stimulation.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                      <span><strong>0 to 3</strong>: Critically low; immediate active resuscitation is vital.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: CORRECTED GESTATIONAL AGE CALCULATOR --- */}
        {subTab === 'gestational' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-9 h-9 bg-teal-50 text-teal-500 rounded-lg flex items-center justify-center text-sm">📅</span>
                Corrected Gestational Age Calculator
              </h2>
              <p className="text-xs text-slate-500 mt-1">Determine the chronological and corrected developmental age of preterm infants for growth charting & milestones.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Inputs Panel (Col 5) */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/50 space-y-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Birth Indices</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dobInput}
                    onChange={(e) => setDobInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="border-t border-slate-200/80 pt-4 space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gestational Age at Birth</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Weeks</label>
                      <input
                        type="number"
                        min="20"
                        max="42"
                        value={gaBirthWeeks}
                        onChange={(e) => setGaBirthWeeks(Math.max(20, Math.min(42, parseInt(e.target.value) || 0)))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Days</label>
                      <input
                        type="number"
                        min="0"
                        max="6"
                        value={gaBirthDays}
                        onChange={(e) => setGaBirthDays(Math.max(0, Math.min(6, parseInt(e.target.value) || 0)))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Assessment Date</label>
                  <input
                    type="date"
                    value={targetDateInput}
                    onChange={(e) => setTargetDateInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Outputs Summary (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age Output</h3>

                {ageCalculation === null ? (
                  <div className="p-8 bg-slate-50 border border-slate-200/50 rounded-2xl text-center text-xs font-semibold text-slate-400">
                    Specify valid DOB and Assessment Target Date to compute gestational age indices.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Chronological Age</span>
                        <div>
                          <h4 className="text-2xl font-black text-slate-800 tracking-tight tabular-nums">
                            {ageCalculation.chronologicalWeeks}w {ageCalculation.chronologicalDays}d
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold block mt-1">From birth date</span>
                        </div>
                      </div>

                      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex flex-col justify-between">
                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-wider block mb-2">Corrected Gestational Age</span>
                        <div>
                          <h4 className="text-2xl font-black text-teal-800 tracking-tight tabular-nums">
                            {ageCalculation.correctedGaWeeks}w {ageCalculation.correctedGaDays}d
                          </h4>
                          <span className="text-[10px] text-teal-600 font-bold block mt-1">Current total post-menstrual age</span>
                        </div>
                      </div>

                    </div>

                    {/* Preterm details */}
                    {ageCalculation.isPreterm ? (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-600">
                          Preterm Development Details
                        </div>
                        <div className="divide-y divide-slate-100 text-xs">
                          
                          <div className="px-4 py-3 flex justify-between">
                            <span className="font-semibold text-slate-500">Degree of Prematurity</span>
                            <span className="font-extrabold text-slate-800">
                              {ageCalculation.weeksPreterm} Weeks Preterm
                            </span>
                          </div>

                          <div className="px-4 py-3 flex justify-between">
                            <span className="font-semibold text-slate-500">Corrected Postnatal Age</span>
                            <span className="font-extrabold text-blue-600">
                              {ageCalculation.correctedAgeWeeks !== null && ageCalculation.correctedAgeWeeks >= 0 ? (
                                `${ageCalculation.correctedAgeWeeks}w ${ageCalculation.correctedAgeDays}d`
                              ) : (
                                'Preterm (Fetus age; not yet reached term date)'
                              )}
                            </span>
                          </div>

                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-bold flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Infant was born at term (&ge;37 completed weeks). Corrected age adjustments are not required.</span>
                      </div>
                    )}

                    {/* Clinical guidelines info */}
                    <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl text-[10px] text-slate-500 leading-relaxed text-left flex gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <strong>Corrected Age Clinical Guidance:</strong>
                        <p className="mt-0.5">
                          Use Corrected Age rather than chronological age when tracking developmental milestones, plotting infant growth charts (e.g. WHO/Fenton), and introducing solid foods. Corrected age is typically utilized until the child reaches 2 years of age chronological.
                        </p>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: DOWNES SCORE CALCULATOR --- */}
        {subTab === 'downes' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm">🫁</span>
                Downes Score for Respiratory Distress
              </h2>
              <p className="text-xs text-slate-500 mt-1">Assess the severity of respiratory distress in neonates using RR, cyanosis, retractions, grunting, and air entry.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Selector List (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                {[
                  {
                    key: 'rr',
                    label: 'Respiratory Rate',
                    options: [
                      { score: 0, text: '< 60 breaths / min' },
                      { score: 1, text: '60 - 80 breaths / min' },
                      { score: 2, text: '> 80 breaths / min or Apneic episode' }
                    ]
                  },
                  {
                    key: 'cyanosis',
                    label: 'Cyanosis',
                    options: [
                      { score: 0, text: 'No cyanosis observed' },
                      { score: 1, text: 'Cyanosis present in room air' },
                      { score: 2, text: 'Cyanosis present in > 40% FiO2' }
                    ]
                  },
                  {
                    key: 'retractions',
                    label: 'Retractions',
                    options: [
                      { score: 0, text: 'No retractions observed' },
                      { score: 1, text: 'Mild / Subcostal or intercostal retractions' },
                      { score: 2, text: 'Severe / Marked retractions' }
                    ]
                  },
                  {
                    key: 'grunting',
                    label: 'Grunting',
                    options: [
                      { score: 0, text: 'No grunting heard' },
                      { score: 1, text: 'Audible only with stethoscope' },
                      { score: 2, text: 'Audible clearly with naked ear' }
                    ]
                  },
                  {
                    key: 'airEntry',
                    label: 'Air Entry (Breath Sounds)',
                    options: [
                      { score: 0, text: 'Clear / Good air entry' },
                      { score: 1, text: 'Mildly decreased / Unequal air entry' },
                      { score: 2, text: 'Barely audible or absent air entry' }
                    ]
                  }
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{item.label}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {item.options.map((opt) => {
                        const isActive = downes[item.key as keyof typeof downes] === opt.score;
                        return (
                          <button
                            key={opt.score}
                            type="button"
                            onClick={() => setDownes(prev => ({ ...prev, [item.key]: opt.score }))}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 font-semibold'}`}
                          >
                            <span className="block text-sm font-black mb-0.5">{opt.score} Point{opt.score !== 1 ? 's' : ''}</span>
                            <span className="text-[10px] leading-tight block opacity-90">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Output Panel (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score Summary</h3>
                
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-center space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Downes Score</span>
                  
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="54" fill="transparent" stroke="#e2ecec" strokeWidth="8" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        fill="transparent" 
                        stroke={downesTotal >= 6 ? '#ef4444' : downesTotal >= 4 ? '#f59e0b' : '#10b981'} 
                        strokeWidth="8" 
                        strokeDasharray={`${(downesTotal / 10) * 339.29} 339.29`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-800 tracking-tight tabular-nums">{downesTotal}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">out of 10</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border text-xs leading-relaxed text-left space-y-1 ${downesInterpretation.color}`}>
                    <strong className="font-bold block">{downesInterpretation.text}</strong>
                    <p className="text-[10px] opacity-90 leading-relaxed">{downesInterpretation.desc}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs text-slate-500 space-y-3">
                  <h4 className="font-bold text-slate-600">Distress Grading Scale:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span><strong>0 to 3</strong>: Mild respiratory distress (observe/oxygen).</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span><strong>4 to 5</strong>: Moderate distress (consider CPAP).</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                      <span><strong>6 to 10</strong>: Severe distress (ventilation indicated).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 6: SILVERMAN-ANDERSEN (SA) SCORE CALCULATOR --- */}
        {subTab === 'sa' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm">👶</span>
                Silverman-Andersen Score (SA Score)
              </h2>
              <p className="text-xs text-slate-500 mt-1">Grade retractions, nasal flaring, and expiratory grunts to assess respiratory difficulty, especially in preterm newborns.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Selector List (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                {[
                  {
                    key: 'upperChest',
                    label: 'Upper Chest Sync',
                    options: [
                      { score: 0, text: 'Synchronized respiration (chest/abdomen rise together)' },
                      { score: 1, text: 'Lag on inspiration (chest lags behind abdomen)' },
                      { score: 2, text: 'Seesaw breathing (chest sinks as abdomen rises)' }
                    ]
                  },
                  {
                    key: 'lowerChest',
                    label: 'Lower Chest Retraction',
                    options: [
                      { score: 0, text: 'No lower chest retraction' },
                      { score: 1, text: 'Just visible / Mild subcostal retractions' },
                      { score: 2, text: 'Marked / Pronounced subcostal retractions' }
                    ]
                  },
                  {
                    key: 'xiphoid',
                    label: 'Xiphoid Retraction',
                    options: [
                      { score: 0, text: 'No xiphoid retraction' },
                      { score: 1, text: 'Just visible / Mild retraction' },
                      { score: 2, text: 'Marked / Pronounced retraction' }
                    ]
                  },
                  {
                    key: 'nares',
                    label: 'Nares Dilation (Nasal Flaring)',
                    options: [
                      { score: 0, text: 'No nares flaring observed' },
                      { score: 1, text: 'Minimal / Mild nares dilation' },
                      { score: 2, text: 'Marked / Significant nares dilation' }
                    ]
                  },
                  {
                    key: 'grunt',
                    label: 'Expiratory Grunt',
                    options: [
                      { score: 0, text: 'No expiratory grunt heard' },
                      { score: 1, text: 'Audible only with stethoscope' },
                      { score: 2, text: 'Audible clearly with naked ear' }
                    ]
                  }
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{item.label}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {item.options.map((opt) => {
                        const isActive = sa[item.key as keyof typeof sa] === opt.score;
                        return (
                          <button
                            key={opt.score}
                            type="button"
                            onClick={() => setSa(prev => ({ ...prev, [item.key]: opt.score }))}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 font-semibold'}`}
                          >
                            <span className="block text-sm font-black mb-0.5">{opt.score} Point{opt.score !== 1 ? 's' : ''}</span>
                            <span className="text-[10px] leading-tight block opacity-90">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Output Panel (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score Summary</h3>
                
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-center space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total SA Score</span>
                  
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="54" fill="transparent" stroke="#e2ecec" strokeWidth="8" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        fill="transparent" 
                        stroke={saTotal >= 7 ? '#ef4444' : saTotal >= 4 ? '#f59e0b' : '#10b981'} 
                        strokeWidth="8" 
                        strokeDasharray={`${(saTotal / 10) * 339.29} 339.29`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-800 tracking-tight tabular-nums">{saTotal}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">out of 10</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border text-xs leading-relaxed text-left space-y-1 ${saInterpretation.color}`}>
                    <strong className="font-bold block">{saInterpretation.text}</strong>
                    <p className="text-[10px] opacity-90 leading-relaxed">{saInterpretation.desc}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs text-slate-500 space-y-3">
                  <h4 className="font-bold text-slate-600">SA Score Distress Index:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0"></span>
                      <span><strong>0</strong>: No respiratory distress signs.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span><strong>1 to 3</strong>: Mild respiratory distress.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span><strong>4 to 6</strong>: Moderate respiratory distress.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                      <span><strong>7 to 10</strong>: Severe respiratory distress.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 7: NASAL CPAP INJURY SCORING --- */}
        {subTab === 'cpapinjury' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center text-sm">🩹</span>
                Nasal CPAP Injury Severity Assessment
              </h2>
              <p className="text-xs text-slate-500 mt-1">Assess pressure-related skin breakdown and nasal trauma across the main anatomic contact sites for nCPAP interfaces.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Site Selectors (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                {[
                  { key: 'bridge', label: 'Nasal Bridge Area' },
                  { key: 'septum', label: 'Nasal Septum' },
                  { key: 'columella', label: 'Nasal Columella' },
                  { key: 'leftNostril', label: 'Left Nostril Rim (Ala)' },
                  { key: 'rightNostril', label: 'Right Nostril Rim (Ala)' }
                ].map((site) => (
                  <div key={site.key} className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-left">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">{site.label}</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[
                        { score: 0, label: 'Stage 0', desc: 'Healthy skin' },
                        { score: 1, label: 'Stage I', desc: 'Erythema' },
                        { score: 2, label: 'Stage II', desc: 'Skin abrasion' },
                        { score: 3, label: 'Stage III', desc: 'Ulcer/Necrosis' }
                      ].map((opt) => {
                        const isActive = cpapInjury[site.key as keyof typeof cpapInjury] === opt.score;
                        const scoreColor = opt.score === 3 ? 'bg-rose-600 text-white' : opt.score === 2 ? 'bg-orange-500 text-white' : opt.score === 1 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';
                        
                        return (
                          <button
                            key={opt.score}
                            type="button"
                            onClick={() => setCpapInjury(prev => ({ ...prev, [site.key]: opt.score }))}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${isActive ? `${scoreColor} border-transparent shadow-sm font-extrabold` : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 font-semibold'}`}
                          >
                            <span className="block text-xs font-bold">{opt.label}</span>
                            <span className="text-[9px] leading-tight block opacity-90 mt-0.5">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Output Panel (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trauma Severity Output</h3>
                
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-center space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Max Injury Classification</span>
                  
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed text-left space-y-2 ${injuryInterpretation.color}`}>
                    <strong className="font-extrabold block text-sm tracking-tight">{injuryInterpretation.stage}</strong>
                    <div className="border-t border-slate-200/50 pt-2 text-[10px] leading-relaxed font-medium">
                      <strong className="block text-slate-700 mb-1">Nursing Intervention Guidelines:</strong>
                      <p className="opacity-90">{injuryInterpretation.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs text-slate-500 space-y-3">
                  <h4 className="font-bold text-slate-600">Injury Index Summary:</h4>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span>Combined Sites Trauma Score:</span>
                    <strong className="text-slate-800 text-sm font-black">{cpapInjuryTotal} pts</strong>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                    * Stage grading conforms to the Fischer et al. Neonatal Nasal Trauma Classification. Monitor skin integrity at least every 4 hours during non-invasive ventilation shifts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
