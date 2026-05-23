export interface BabyProfile {
  name: string;
  birthDate: string;
  nicuStartDate: string;
  hospitalName: string;
  parentName: string;
  notes?: string;
}

export interface DailyEntry {
  id?: string;
  date: string;
  weight?: number; // in grams
  feedingNotes?: string;
  pumpingNotes?: string;
  medications?: string;
  milestones?: string;
  questions?: string; // questions for care team
  notes?: string; // general notes
}

export interface ContactSubmission {
  name: string;
  email: string;
  role: string;
  message: string;
  createdAt: any;
}

export interface Patient {
  id?: string;
  name: string;
  uhid: string;
  dob: string;
  admissionDate: string;
  unit: 'NICU' | 'NICU 1' | 'NICU 2' | 'SNCU';
  admissionType: 'Inborn' | 'Outborn';
  diagnosis: 'Pre Term' | 'Severe Birth Asphyxia' | 'SEPSIS' | 'RDS' | 'Others' | string;
  status: 'Admitted' | 'Discharged' | 'Died' | 'LAMA' | 'Transferred';
  outcomeDate?: string;
  bedNumber?: number;
  rbsLog?: Array<{ value: number; timestamp: string }>;
  notes?: string;
  culturePositive?: boolean;
  cultureOrganism?: string;
  cultureOrganismOther?: string;
  cultureSensitivity1?: string;
  cultureSensitivity1Pattern?: 'S' | 'I' | 'R' | '';
  cultureSensitivity2?: string;
  cultureSensitivity2Pattern?: 'S' | 'I' | 'R' | '';
  createdAt?: any;
  updatedAt?: any;
}

