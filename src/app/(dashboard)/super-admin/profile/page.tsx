"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import ProfileForm from "@/components/ProfileForm";

export default function SuperAdminProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Chargement...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-700 tracking-tight">Mon Profil</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos informations personnelles et vos paramètres de sécurité.
        </p>
      </div>
      
      <ProfileForm role={user.role} />
    </div>
  );
} 