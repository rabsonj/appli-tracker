import { ColumnDef } from "@tanstack/react-table";
import { Application, User } from "@/src/types/api";

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

export interface AuditLog {
  id: number;
  actor: User;
  from_status: Status;
  to_status: Status;
  comment: string;
  created_at: string;
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

export interface ApiError {
  error: string;
  detail: string;
  status_code: number;
}

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
};
