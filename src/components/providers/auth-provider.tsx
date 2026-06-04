"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
