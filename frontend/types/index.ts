import { ColumnDef } from "@tanstack/react-table";
import { components } from "@/src/types/api";

enum ReturnForChangesEnum {
  ReturnForChanges = "returned_for_changes"
}

export type Application = components["schemas"]["Application"];
export type ApplicationWrite = components["schemas"]["ApplicationWrite"];
export type PatchedApplication = components["schemas"]["PatchedApplicationWrite"];
export type User = components["schemas"]["User"];
export type AuditLog = components["schemas"]["AuditLog"];
export type ApplicationStatusEnum = components["schemas"]["StatusEnum"] | ReturnForChangesEnum;
export type ApplicationCategoryEnum = components["schemas"]["CategoryEnum"];
export type RoleEnum = components["schemas"]["RoleEnum"];
export type AuthToken = components["schemas"]["TokenRefresh"];

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

export interface ApplicationRejectionPayload {
  comment: string
}

export interface ApplicationReturnedForChangesPayload {
  comment: string
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

export interface Login {
  username: string
  password: string
}
