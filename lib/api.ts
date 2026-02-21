// API configuration and helpers
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "")

// ── Helpers authentifiés (utilisent le backendToken NextAuth) ──────────────

export async function apiFetch(
  path: string,
  backendToken: string,
  options: RequestInit = {}
): Promise<Response> {
  const { headers: extraHeaders, ...rest } = options
  return fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
      ...(extraHeaders as Record<string, string>),
    },
  })
}

export async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await apiFetch(path, token)
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, token, { method: "POST", body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

/**
 * Le backend n'expose pas GET /scan/{id} ni GET /scans/{id}.
 * On fetche la liste GET /scans et on filtre par ID.
 */
export async function apiGetScanById<T>(scanId: string, token: string): Promise<T> {
  const list = await apiGet<T[]>("/scans", token)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scan = list.find((s: any) => s.id === scanId)
  if (!scan) throw new Error(`Scan ${scanId} introuvable dans la liste`)
  return scan
}

export async function apiPatch<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, token, { method: "PATCH", body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

export async function apiDelete(path: string, token: string, body?: unknown): Promise<void> {
  const res = await apiFetch(path, token, {
    method: "DELETE",
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}`)
}

// ── Helper sans auth (inchangé, pour l'existant) ──────────────────────────

export interface ApiError {
  detail: string
}

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.detail || "An error occurred")
    }

    return response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Server connection error")
  }
}

// Organizations API
export interface Organization {
  id: number
  name: string
  dpo_name?: string
  dpo_email?: string
  address?: string
  phone?: string
  website?: string
  created_at?: string
  updated_at?: string
}

// Data Processing API
export interface DataProcessing {
  id: number
  organization_id: number
  name: string
  purpose: string
  legal_basis: string
  data_categories?: string
  retention_period?: string
  recipients?: string
  created_at?: string
  updated_at?: string
}

// DPIA API
export interface DPIA {
  id: number
  organization_id: number
  processing_id?: number
  title: string
  description?: string
  necessity_assessment?: string
  proportionality_assessment?: string
  risk_level?: string
  mitigation_measures?: string
  status: string
  created_at?: string
  updated_at?: string
}

// Audits API
export interface Audit {
  id: number
  organization_id: number
  title: string
  audit_date: string
  auditor_name?: string
  scope?: string
  findings?: string
  recommendations?: string
  status: string
  created_at?: string
  updated_at?: string
}

// Compliance Scores API
export interface ComplianceScore {
  id: number
  organization_id: number
  score: number
  assessment_date: string
  category?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

// Data Breaches API
export interface DataBreach {
  id: number
  organization_id: number
  title: string
  description?: string
  breach_date: string
  discovery_date?: string
  affected_count?: number
  severity: string
  notification_required: boolean
  notification_date?: string
  status: string
  remediation_actions?: string
  created_at?: string
  updated_at?: string
}

// Rights Requests API
export interface RightsRequest {
  id: number
  organization_id: number
  subject_id?: number
  request_type: string
  description?: string
  received_date: string
  deadline_date: string
  status: string
  response?: string
  response_date?: string
  created_at?: string
  updated_at?: string
}

// Training Modules API
export interface TrainingModule {
  id: number
  organization_id: number
  title: string
  description?: string
  content?: string
  duration_minutes?: number
  required: boolean
  created_at?: string
  updated_at?: string
}

// Data Subjects API
export interface DataSubject {
  id: number
  organization_id: number
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  data_categories?: string
  consent_status?: string
  created_at?: string
  updated_at?: string
}

// Notification Templates API
export interface NotificationTemplate {
  id: string
  organization_id: string
  template_name: string
  template_type: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

const notificationTemplatesApi = {
  list: () => apiRequest<NotificationTemplate[]>("/notification-templates/"),
  get: (id: string) => apiRequest<NotificationTemplate>(`/notification-templates/${id}`),
  create: (data: Partial<NotificationTemplate>) =>
    apiRequest<NotificationTemplate>("/notification-templates/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<NotificationTemplate>) =>
    apiRequest<NotificationTemplate>(`/notification-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/notification-templates/${id}`, {
      method: "DELETE",
    }),
}

export const api = {
  organizations: {
    list: () => apiRequest<Organization[]>("/organizations/"),
    get: (id: string) => apiRequest<Organization>(`/organizations/${id}`),
    create: (data: Partial<Organization>) =>
      apiRequest<Organization>("/organizations/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Organization>) =>
      apiRequest<Organization>(`/organizations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/organizations/${id}`, {
        method: "DELETE",
      }),
  },
  dataProcessing: {
    list: () => apiRequest<DataProcessing[]>("/data-processing/"),
    get: (id: string) => apiRequest<DataProcessing>(`/data-processing/${id}`),
    create: (data: Partial<DataProcessing>) =>
      apiRequest<DataProcessing>("/data-processing/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<DataProcessing>) =>
      apiRequest<DataProcessing>(`/data-processing/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/data-processing/${id}`, {
        method: "DELETE",
      }),
  },
  dpia: {
    list: () => apiRequest<DPIA[]>("/dpia/"),
    get: (id: string) => apiRequest<DPIA>(`/dpia/${id}`),
    create: (data: Partial<DPIA>) =>
      apiRequest<DPIA>("/dpia/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<DPIA>) =>
      apiRequest<DPIA>(`/dpia/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/dpia/${id}`, {
        method: "DELETE",
      }),
  },
  audits: {
    list: () => apiRequest<Audit[]>("/audits/"),
    get: (id: string) => apiRequest<Audit>(`/audits/${id}`),
    create: (data: Partial<Audit>) =>
      apiRequest<Audit>("/audits/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Audit>) =>
      apiRequest<Audit>(`/audits/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/audits/${id}`, {
        method: "DELETE",
      }),
  },
  complianceScores: {
    list: () => apiRequest<ComplianceScore[]>("/compliance-scores/"),
    get: (id: string) => apiRequest<ComplianceScore>(`/compliance-scores/${id}`),
    create: (data: Partial<ComplianceScore>) =>
      apiRequest<ComplianceScore>("/compliance-scores/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<ComplianceScore>) =>
      apiRequest<ComplianceScore>(`/compliance-scores/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/compliance-scores/${id}`, {
        method: "DELETE",
      }),
  },
  dataBreaches: {
    list: () => apiRequest<DataBreach[]>("/data-breaches/"),
    get: (id: string) => apiRequest<DataBreach>(`/data-breaches/${id}`),
    create: (data: Partial<DataBreach>) =>
      apiRequest<DataBreach>("/data-breaches/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<DataBreach>) =>
      apiRequest<DataBreach>(`/data-breaches/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/data-breaches/${id}`, {
        method: "DELETE",
      }),
  },
  rightsRequests: {
    list: () => apiRequest<RightsRequest[]>("/rights-requests/"),
    get: (id: string) => apiRequest<RightsRequest>(`/rights-requests/${id}`),
    create: (data: Partial<RightsRequest>) =>
      apiRequest<RightsRequest>("/rights-requests/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<RightsRequest>) =>
      apiRequest<RightsRequest>(`/rights-requests/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/rights-requests/${id}`, {
        method: "DELETE",
      }),
  },
  trainingModules: {
    list: () => apiRequest<TrainingModule[]>("/training-modules/"),
    get: (id: string) => apiRequest<TrainingModule>(`/training-modules/${id}`),
    create: (data: Partial<TrainingModule>) =>
      apiRequest<TrainingModule>("/training-modules/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<TrainingModule>) =>
      apiRequest<TrainingModule>(`/training-modules/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/training-modules/${id}`, {
        method: "DELETE",
      }),
  },
  dataSubjects: {
    list: () => apiRequest<DataSubject[]>("/data-subjects/"),
    get: (id: string) => apiRequest<DataSubject>(`/data-subjects/${id}`),
    create: (data: Partial<DataSubject>) =>
      apiRequest<DataSubject>("/data-subjects/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<DataSubject>) =>
      apiRequest<DataSubject>(`/data-subjects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/data-subjects/${id}`, {
        method: "DELETE",
      }),
  },
  notificationTemplates: notificationTemplatesApi,
}

export const organizationsApi = api.organizations
export const dataProcessingApi = api.dataProcessing
export const dpiaApi = api.dpia
export const auditsApi = api.audits
export const complianceScoresApi = api.complianceScores
export const dataBreachesApi = api.dataBreaches
export const rightsRequestsApi = api.rightsRequests
export const trainingModulesApi = api.trainingModules
export const dataSubjectsApi = api.dataSubjects
