import {
  Application,
  PatchedApplication,
  RejectApplication,
  ReturnForChanges,
} from "@/src/types/api";
import { ApplicationWritePayload } from "@/types";
import { apiClient } from "@/lib/axios";

/**
 * Fetches all applications.
 * @returns A list of applications.
 */
export async function fetchApplications(): Promise<Application[]> {
  const response = await apiClient.get("/applications/");
  return response.data;
}

/**
 * Fetches a single application.
 * @param id - The application ID.
 * @returns The application.
 */
export const fetchApplication = async (id: number): Promise<Application> => {
  const res = await apiClient.get(`/applications/${id}/`);
  return res.data;
};

/**
 * Creates a new application.
 * @param data - The application data.
 * @returns The created application.
 */
export const createApplication = async (
  data: ApplicationWritePayload
): Promise<Application> => {
  const res = await apiClient.post("/applications/", data);
  return res.data;
};

/**
 * Updates an application.
 * @param id - The application ID.
 * @param data - The application data.
 * @returns The updated application.
 */
export const updateApplication = async (
  id: number,
  data: PatchedApplication
): Promise<Application> => {
  const res = await apiClient.patch(`/applications/${id}/`, data);
  return res.data;
};

/**
 * Submits an application.
 * @param id - The application ID.
 * @returns The submitted application.
 */
export const submitApplication = async (id: number): Promise<Application> => {
  const res = await apiClient.post(`/applications/${id}/submit/`);
  return res.data;
};

/**
 * Starts the review of an application.
 * @param id - The application ID.
 * @returns The application with the review started.
 */
export const startReview = async (id: number): Promise<Application> => {
  const res = await apiClient.post(`/applications/${id}/start-review/`);
  return res.data;
};

/**
 * Approves an application.
 * @param id - The application ID.
 * @returns The approved application.
 */
export const approveApplication = async (id: number): Promise<Application> => {
  const res = await apiClient.post(`/applications/${id}/approve/`);
  return res.data;
};

/**
 * Rejects an application.
 * @param id - The application ID.
 * @param data - The rejection comment.
 * @returns The rejected application.
 */
export const rejectApplication = async (
  id: number,
  data: RejectApplication
): Promise<Application> => {
  const res = await apiClient.post(`/applications/${id}/reject/`, data);
  return res.data;
};

/**
 * Returns an application for changes.
 * @param id - The application ID.
 * @param data - The comment with the required changes.
 * @returns The application returned for changes.
 */
export const returnForChanges = async (
  id: number,
  data: ReturnForChanges
): Promise<Application> => {
  const res = await apiClient.post(`/applications/${id}/return-for-changes/`, data);
  return res.data;
};
