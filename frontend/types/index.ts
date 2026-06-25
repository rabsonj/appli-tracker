export type Role = "applicant" | "reviewer";

export type Status =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export type Category =
  | "general"
  | "budget"
  | "leave"
  | "procurement"
  | "other";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
}

export interface AuditLog {
  id: number;
  actor: User;
  from_status: Status;
  to_status: Status;
  comment: string;
  created_at: string;
}

export interface Application {
  id: number;
  owner: User;
  title: string;
  category: Category;
  description: string;
  amount: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
  audit_logs: AuditLog[];
}

export interface ApplicationWritePayload {
  title: string;
  category: Category;
  description?: string;
  amount?: string;
}

export interface TransitionCommentPayload {
  comment: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface ApiError {
  error: string;
  detail: string;
  status_code: number;
}
