import { ColumnDef } from "@tanstack/react-table";
import { components } from "@/src/types/api";

export type Application = components["schemas"]["Application"];
export type ApplicationWrite = components["schemas"]["ApplicationWrite"];
export type PatchedApplication = components["schemas"]["PatchedApplicationWrite"];
export type User = components["schemas"]["User"];
export type AuditLog = components["schemas"]["AuditLog"];
export type ApplicationStatusEnum = components["schemas"]["StatusEnum"];
export type ApplicationCategoryEnum = components["schemas"]["CategoryEnum"];
export type RoleEnum = components["schemas"]["RoleEnum"];

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
