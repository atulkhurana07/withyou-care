export type Role = "doctor" | "receptionist" | "admin" | "patient";
export type CandidateStatus =
  "extracted" | "needs_clarification" | "verified" | "rejected" | "approved";
export type Candidate = {
  id: string;
  title: string;
  instruction: string;
  source: string;
  times: string[];
  start: string;
  end: string;
  status: CandidateStatus;
  type: "medication" | "follow-up" | "care";
  issues: string[];
};
export type Patient = {
  id: string;
  tenantId: string;
  name: string;
  age: number;
  phone: string;
  language: string;
  invitationOptIn: boolean;
  encounterId: string;
  doctorId: string;
  doctorName?: string;
  state: string;
  accountUid?: string;
  email?: string;
  contactVerified?: boolean;
  registeredBy?: string;
  createdAt?: string;
  invitationPermissionAt?: string | null;
  contactVerifiedAt?: string | null;
};
export type Report = {
  id: string;
  tenantId: string;
  patientId: string;
  encounterId: string;
  doctorId: string;
  notes: string;
  version: number;
  state: "draft" | "awaiting_review" | "published" | "superseded";
  candidates: Candidate[];
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedRegistration?: string;
};
export type CareTask = Candidate & {
  patientId: string;
  reportId: string;
  version: number;
  tenantId: string;
  timezone: string;
  completion: "scheduled" | "completed" | "skipped";
  completedAt?: string;
};
