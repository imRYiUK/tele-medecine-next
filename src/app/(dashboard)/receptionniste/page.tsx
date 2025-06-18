"use client";
import { useAuth } from "@/lib/hooks/useAuth";

export default function ReceptionnisteDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bienvenue, {user?.prenom} {user?.nom}</h2>
      <p className="text-gray-600">Interface de gestion pour le/la réceptionniste. Utilisez le menu à gauche pour accéder aux patients, rendez-vous, et ajouter de nouveaux patients.</p>
    </div>
  );
} 