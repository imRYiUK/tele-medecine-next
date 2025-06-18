"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Activity, AlertTriangle } from 'lucide-react';
import { dashboardService, DashboardStats } from '@/lib/services/dashboard.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      id: 'users',
      title: 'Utilisateurs',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Utilisateurs actifs',
      iconColor: 'text-blue-600',
    },
    {
      id: 'establishments',
      title: 'Établissements',
      value: stats?.totalEstablishments || 0,
      icon: Building2,
      description: 'Établissements enregistrés',
      iconColor: 'text-green-600',
    },
    {
      id: 'activities',
      title: 'Activités',
      value: stats?.totalActivities || 0,
      icon: Activity,
      description: 'Actions enregistrées',
      iconColor: 'text-purple-600',
    },
    {
      id: 'alerts',
      title: 'Alertes',
      value: 0,
      icon: AlertTriangle,
      description: 'Alertes en attente',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Tableau de bord Super Admin</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.id} className="shadow-lg bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">{stat.title}</CardTitle>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <p className="text-sm text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-gray-800">
                    {activity.utilisateur.prenom} {activity.utilisateur.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {format(new Date(activity.dateAction), 'PPp', { locale: fr })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 