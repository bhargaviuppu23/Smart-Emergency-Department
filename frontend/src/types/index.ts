export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type PatientStatus = 'WAITING' | 'IN_TREATMENT' | 'COMPLETED' | 'CANCELLED';

export interface Patient {
  id: number;
  patientIdentifier: string;
  fullName: string;
  age: number;
  gender?: string;
  presentingComplaint: string;
  severity: Severity;
  status: PatientStatus;
  triageNotes?: string;
  arrivalTime: string;
  treatmentStartTime?: string;
  treatmentEndTime?: string;
  actualWaitDurationMinutes?: number;
  treatmentDurationMinutes?: number;
  arrivalSequenceNumber: number;
  queuePosition?: number;
  demo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  patientId: number;
  patientIdentifier: string;
  fullName: string;
  age: number;
  severity: Severity;
  priorityRank: number;
  severityColor: string;
  arrivalTime: string;
  arrivalSequenceNumber: number;
  presentingComplaint: string;
  queuePosition: number;
  currentWaitMinutes: number;
  demo: boolean;
}

export interface AnalyticsSummary {
  totalRegistered: number;
  waitingCount: number;
  criticalCount: number;
  highPriorityCount: number;
  inTreatmentCount: number;
  completedCount: number;
  cancelledCount: number;
  averageWaitMinutes: number | null;
  averageTreatmentMinutes: number | null;
  minWaitMinutes: number | null;
  maxWaitMinutes: number | null;
  severityCounts: Record<Severity, number>;
  statusCounts: Record<PatientStatus, number>;
}

export interface HourlyTrend {
  timeSlot: string;
  arrivals: number;
  completions: number;
}

export interface WaitingTimeMetrics {
  calculationDefinition: string;
  averageWaitMinutes: number | null;
  minWaitMinutes: number | null;
  maxWaitMinutes: number | null;
  averageTreatmentDurationMinutes: number | null;
  eligiblePatientCount: number;
  averageWaitBySeverity: Record<string, number | null>;
  hourlyVolumeTrends: HourlyTrend[];
}

export interface SeverityDistribution {
  severity: Severity;
  label: string;
  priorityRank: number;
  color: string;
  count: number;
  percentage: number;
}

export interface QueueEvent {
  id: number;
  patientId?: number;
  patientIdentifier?: string;
  eventType: string;
  description: string;
  timestamp: string;
}

export interface PatientRequest {
  fullName: string;
  age: number;
  gender?: string;
  presentingComplaint: string;
  severity: Severity;
  triageNotes?: string;
}

export interface UpdatePatientRequest {
  presentingComplaint?: string;
  severity?: Severity;
  triageNotes?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
