"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Ne rien faire tant que c'est en chargement
    if (!user) {
      router.push("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  if (!user || !allowedRoles.includes(user.role)) return null;
  return <>{children}</>;
} 