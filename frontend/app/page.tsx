"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

/**
 * Renders the home page, which redirects the user based on their authentication status and role.
 * @returns null
 */
export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    if (user?.role === "reviewer") {
      router.replace("/queue");
    } else {
      router.replace("/applications");
    }
  }, [user, isAuthenticated, router]);

  return null;
}
