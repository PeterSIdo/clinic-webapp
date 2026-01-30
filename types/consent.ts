export interface ClientInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
}

export interface HealthCheckData {
  // Medical History
  heartConditions: boolean;
  bleedingDisorders?: boolean; // Only for acupuncture
  highLowBloodPressure?: boolean; // Only for general
  circulatoryProblems?: boolean; // Only for general
  diabetes: boolean;
  epilepsy: boolean;
  infectiousDiseases: boolean;
  skinConditions: boolean;
  pregnancy: boolean;
  allergies: boolean;
  allergiesDetails?: string;
  otherConditions: boolean;
  otherConditionsDetails?: string;
  
  // Current Health
  underMedicalCare: boolean;
  takingMedications: boolean;
  medicationsList?: string;
  recentInjuriesSurgeries: boolean;
  recentInjuriesDetails?: string; // Details for injuries, fractures, or surgeries
  painStiffnessAreas?: boolean; // Only for general
  painStiffnessDetails?: string; // Only for general
  concernsAboutAcupuncture?: boolean; // Only for acupuncture
  concernsAboutMassage?: boolean; // Only for general
  
  // Lifestyle
  smokes: boolean;
  drinksAlcohol: boolean;
  exercisesRegularly: boolean;
  
  // Consent confirmations
  disclosedHealthInfo: boolean;
  understandsTreatment: boolean;
  understandsWithdrawal?: boolean; // Only for acupuncture
  consentsToTreatment: boolean;
}

export interface ConsentTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentData {
  id: string;
  clientInfo: ClientInfo;
  templateId: string;
  templateVersion: string;
  signature: string; // Base64 encoded signature image
  consentText: string; // Snapshot of consent text at time of signing
  agreedAt: string; // ISO date string
  ipAddress?: string;
  deviceInfo?: string;
  healthCheckData?: HealthCheckData; // Optional health check form data
}

export interface ConsentFormProps {
  onSubmit?: (data: ConsentData) => void;
  initialData?: Partial<ConsentData>;
  consentTemplate?: ConsentTemplate;
}
