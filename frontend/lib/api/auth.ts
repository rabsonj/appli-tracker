import { apiClient } from "@/lib/axios";
import { AuthToken, Login, User } from "@/src/types/api";

/**
 * Logs in a user.
 * @param payload - The login payload.
 * @returns The authentication tokens and user information.
 */
export async function login(payload: Login): Promise<AuthToken> {
  const response = await apiClient.post<AuthToken>("/auth/login/", payload);
  return response.data;
}

/**
 * Fetches the current user.
 * @returns The current user.
 */
export async function fetchMe(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me/");
  return response.data;
}
