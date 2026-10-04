export type IssueCategory = 
  | 'BROKEN_SEWER' 
  | 'WATER_POOLING' 
  | 'CLOGGED_DRAIN' 
  | 'OPEN_MANHOLE' 
  | 'FLUSHING_BACKFLOW' 
  | 'PIPE_BURST';

export type HazardSeverity = 'LOW' | 'MODERATE' | 'CRITICAL_EMERGENCY';

export type DepartmentType = 
  | 'ALL MEMBERS'
  | 'ADMINISTRATION'
  | 'COMMUNITY AUDITS'
  | 'TECHNICAL GUIDANCE'
  | 'SCRIPT & WORKSHOPS';

export interface MunicipalOffice {
  id: string;
  name: string;
  zone: string;
  sector: string;
  address: string;
  distanceKm: number;
  lat: number;
  lng: number;
  helpline: string;
  whatsapp: string;
  nodalOfficerName: string;
  nodalOfficerEmail: string;
  nodalOfficerPhone: string;
  status: 'OPEN_NOW' | 'CLOSED' | '24_7_EMERGENCY';
  openHours: string;
}

export interface UrbanWaterIssue {
  id: string;
  title: string;
  category: IssueCategory;
  severity: HazardSeverity;
  description: string;
  imageUrl: string;
  location: string;
  reportedCount: number;
  badge: string;
}

export interface ReportFormData {
  category: IssueCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  photoBase64?: string;
  photoPreviewUrl?: string;
  severity: HazardSeverity;
  description: string;
  contactName: string;
  contactPhone: string;
}

export interface EscalationPortal {
  name: string;
  url: string;
  description: string;
}

export interface AnalysisResult {
  ticketId: string;
  timestamp: string;
  priorityLevel: string;
  priorityBadgeColor: 'cyan' | 'emerald' | 'red';
  summary: string;
  damageAssessment: string;
  estimatedRestoration: string;
  safetyAdvisory: string[];
  escalationPortals: EscalationPortal[];
  nodalOfficer: {
    name: string;
    designation: string;
    phone: string;
    email: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: DepartmentType;
  bio: string;
  avatar: string;
  skills: string[];
  email: string;
  location: string;
  activeTask: string;
}

export interface DIYGuide {
  id: string;
  title: string;
  category: string;
  duration: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  summary: string;
  toolsNeeded: string[];
  safetyWarning: string;
  steps: string[];
}
