import { User } from "@/types";

/**
 * Returns initials for a user based on available identity fields.
 *
 * Priority order:
 * 1. First letter of first name + first letter of last name (if both exist)
 * 2. First two letters of username
 * 3. First two letters of email
 * 4. Empty string if none available
 *
 * The result is always returned in uppercase.
 *
 * @param user - The user object containing identity information.
 * @returns The computed initials (uppercase string).
 */
export function getInitials(user: User | null): string {
  const first = user?.first_name?.trim();
  const last = user?.last_name?.trim();
  const username = user?.username?.trim();
  const email = user?.email?.trim();

  const fromNames =
    first && last ? `${first[0]}${last[0]}` : null;

  const fromUsername = username?.slice(0, 2) ?? null;

  const fromEmail = email?.slice(0, 2) ?? "";

  const initials = fromNames ?? fromUsername ?? fromEmail;

  return initials.toUpperCase();
}
