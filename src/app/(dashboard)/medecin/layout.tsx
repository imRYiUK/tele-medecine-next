"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Users,
  Calendar,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Stethoscope
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationWidget from "@/components/NotificationWidget";

const navigation = [
  { name: "Dashboard", href: "/medecin", icon: Activity },
  { name: "Patients", href: "/medecin/patients", icon: Users },
  { name: "Rendez-vous", href: "/medecin/rendez-vous", icon: Calendar },
  { name: "Consultation", href: "/medecin/consultation", icon: Stethoscope },
  { name: "Profil", href: "/medecin/profile", icon: User },
];

export default function MedecinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <RoleGuard allowedRoles={["MEDECIN"]}>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          <div className="fixed inset-0" style={{ background: 'rgba(128,128,128,0.3)' }} onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4">
              <span className="text-xl font-semibold text-emerald-600">Médecin</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => logout()}
                className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex h-16 items-center px-4">
              <span className="text-xl font-semibold text-emerald-600">Médecin</span>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => logout()}
                className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-16 flex-shrink-0 bg-white shadow">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-1 justify-between px-4">
              <div className="flex flex-1"></div>
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <NotificationWidget />
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.prenom} {user?.nom}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
} 