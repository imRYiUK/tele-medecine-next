"use client";

import { useAuth } from '@/lib/hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Télémédecine Sénégal</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">
                Bienvenue, {user?.prenom} {user?.nom}
              </span>
              <button
                onClick={() => logout()}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold mb-4">Tableau de bord</h2>
            <p>Bienvenue dans votre espace de télémédecine.</p>
          </div>
        </div>
      </main>
    </div>
  );
} 