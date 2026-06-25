"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

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
