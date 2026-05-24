export interface BiliThresholdPoint {
  hours: number;
  photoNoRisk: number;
  photoWithRisk: number;
  exchangeNoRisk: number;
  exchangeWithRisk: number;
}

export const BILI_DATA_BY_GA: Record<number, BiliThresholdPoint[]> = {
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

export interface PretermBiliThresholds {
  photoLower: number;
  photoUpper: number;
  exchangeLower: number;
  exchangeUpper: number;
}

export const PRETERM_BILI_THRESHOLDS: Record<string, PretermBiliThresholds> = {
  '<28': { photoLower: 5.0, photoUpper: 6.0, exchangeLower: 11.0, exchangeUpper: 14.0 },
  '28-29': { photoLower: 6.0, photoUpper: 8.0, exchangeLower: 12.0, exchangeUpper: 14.0 },
  '30-31': { photoLower: 8.0, photoUpper: 10.0, exchangeLower: 13.0, exchangeUpper: 16.0 },
  '32-33': { photoLower: 10.0, photoUpper: 12.0, exchangeLower: 15.0, exchangeUpper: 18.0 },
  '34': { photoLower: 12.0, photoUpper: 14.0, exchangeLower: 17.0, exchangeUpper: 19.0 }
};

export function getPretermGaGroup(weeks: number): string {
  if (weeks < 28) return '<28';
  if (weeks === 28 || weeks === 29) return '28-29';
  if (weeks === 30 || weeks === 31) return '30-31';
  if (weeks === 32 || weeks === 33) return '32-33';
  return '34';
}

export interface BiliCalculationResult {
  phototherapy: number;
  exchange: number;
  escalation: number;
  isPreterm: boolean;
  classification: {
    label: string;
    color: string;
    icon: string;
    type: 'safe' | 'monitor' | 'photo' | 'warning' | 'critical';
  };
}

export function calculateBiliCutoffs(
  gaWeeks: number,
  ageHours: number,
  hasRisk: boolean,
  tsbMgDl: number
): BiliCalculationResult {
  const isPreterm = gaWeeks < 35;
  
  let phototherapy = 0;
  let exchange = 0;
  let escalation = 0;

  if (isPreterm) {
    const group = getPretermGaGroup(gaWeeks);
    const limits = PRETERM_BILI_THRESHOLDS[group];
    phototherapy = hasRisk ? limits.photoLower : limits.photoUpper;
    exchange = hasRisk ? limits.exchangeLower : limits.exchangeUpper;
    escalation = Math.max(0, exchange - 2.0);
  } else {
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

    const pLower = hasRisk ? lower.photoWithRisk : lower.photoNoRisk;
    const pUpper = hasRisk ? upper.photoWithRisk : upper.photoNoRisk;
    phototherapy = parseFloat((pLower + (pUpper - pLower) * factor).toFixed(1));

    const eLower = hasRisk ? lower.exchangeWithRisk : lower.exchangeNoRisk;
    const eUpper = hasRisk ? upper.exchangeWithRisk : upper.exchangeNoRisk;
    exchange = parseFloat((eLower + (eUpper - eLower) * factor).toFixed(1));
    escalation = parseFloat((Math.max(0, exchange - 2.0)).toFixed(1));
  }

  // Classification logic
  let classification: BiliCalculationResult['classification'] = {
    label: 'Below Phototherapy Threshold',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: '✅',
    type: 'safe'
  };

  if (tsbMgDl >= exchange) {
    classification = {
      label: 'Exchange Transfusion Indicated',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: '🚨',
      type: 'critical'
    };
  } else if (tsbMgDl >= escalation) {
    classification = {
      label: 'Escalation of Care / Intensive Photo Indicated',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      icon: '⚠️',
      type: 'warning'
    };
  } else if (tsbMgDl >= phototherapy) {
    classification = {
      label: 'Phototherapy Indicated',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: '💡',
      type: 'photo'
    };
  } else if (tsbMgDl >= phototherapy - 2.0) {
    classification = {
      label: 'Bilirubin Close to Threshold (Monitor closely)',
      color: 'text-blue-700 bg-blue-50 border-blue-100',
      icon: '📈',
      type: 'monitor'
    };
  }

  return {
    phototherapy,
    exchange,
    escalation,
    isPreterm,
    classification
  };
}
