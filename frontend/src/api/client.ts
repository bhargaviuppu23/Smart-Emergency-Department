import {
  Patient,
  QueueItem,
  AnalyticsSummary,
  WaitingTimeMetrics,
  SeverityDistribution,
  QueueEvent,
  PatientRequest,
  UpdatePatientRequest,
  PageResponse,
  Severity,
  PatientStatus
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    const details = data?.details;
    throw new ApiError(response.status, errorMsg, details);
  }

  return data as T;
}

export const api = {
  // Live Queue
  getLiveQueue: () => request<QueueItem[]>('/api/queue'),
  peekNext: () => request<QueueItem | null>('/api/queue/next'),
  startNext: () => request<Patient>('/api/queue/start-next', { method: 'POST' }),
  getFifoQueue: (severity: Severity) => request<any[]>(`/api/queue/fifo/${severity}`),

  // Patients
  registerPatient: (data: PatientRequest) =>
    request<Patient>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPatients: (params?: {
    search?: string;
    severity?: Severity;
    status?: PatientStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDir) query.append('sortDir', params.sortDir);

    const qs = query.toString();
    return request<PageResponse<Patient>>(`/api/patients${qs ? `?${qs}` : ''}`);
  },

  getPatientById: (id: number) => request<Patient>(`/api/patients/${id}`),

  updatePatient: (id: number, data: UpdatePatientRequest) =>
    request<Patient>(`/api/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: PatientStatus) =>
    request<Patient>(`/api/patients/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  startTreatment: (id: number) =>
    request<Patient>(`/api/patients/${id}/start-treatment`, { method: 'POST' }),

  completeTreatment: (id: number, notes?: string) =>
    request<Patient>(`/api/patients/${id}/complete-treatment`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  cancelPatient: (id: number, reason?: string) =>
    request<Patient>(`/api/patients/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Analytics
  getSummary: () => request<AnalyticsSummary>('/api/analytics/summary'),
  getWaitingTimeMetrics: () => request<WaitingTimeMetrics>('/api/analytics/waiting-times'),
  getSeverityDistribution: () => request<SeverityDistribution[]>('/api/analytics/severity-distribution'),

  // Events
  getRecentEvents: (limit = 30) => request<QueueEvent[]>(`/api/events?limit=${limit}`),
  getPatientEvents: (patientId: number) => request<QueueEvent[]>(`/api/events/patient/${patientId}`),

  // Demo Simulation
  generateDemo: (count = 6, clearExisting = false) =>
    request<Patient[]>('/api/demo/generate', {
      method: 'POST',
      body: JSON.stringify({ count, clearExisting }),
    }),

  resetDemo: () => request<{ status: string; message: string }>('/api/demo/reset', { method: 'DELETE' }),
};
