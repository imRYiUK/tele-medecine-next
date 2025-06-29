"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Activity, AlertTriangle } from 'lucide-react';
import { dashboardService } from '@/lib/services/dashboard.service';
import { etablissementsService, Etablissement } from '@/lib/services/etablissements.service';
import { useAuth } from '@/lib/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.etablissementID) {
          setError('Aucun établissement associé' as string);
          setLoading(false);
          return;
        }
        const [etab, data] = await Promise.all([
          etablissementsService.getById(user.etablissementID),
          dashboardService.getStats()
        ]);
        setEtablissement(etab);
        setStats(data);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.etablissementID) fetchData();
  }, [user?.etablissementID]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Tableau de bord Administrateur</h1>
      <div className="mb-4">
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Établissement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-primary">{etablissement?.nom}</div>
                <div className="text-sm text-gray-600">{etablissement?.adresse}</div>
                <div className="text-sm text-gray-600">{etablissement?.region}</div>
                <div className="text-sm text-gray-600">{etablissement?.email}</div>
                <div className="text-sm text-gray-600">{etablissement?.telephone}</div>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${etablissement?.estActif ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{etablissement?.estActif ? 'Actif' : 'Inactif'}</span>
                <span className="text-xs text-gray-400">Créé le {etablissement?.createdAt ? format(new Date(etablissement.createdAt), 'P', { locale: fr }) : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">Utilisateurs</CardTitle>
            <Users className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{stats?.totalUsers || 0}</div>
            <p className="text-sm text-gray-500">Utilisateurs de l'établissement</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">Consultations</CardTitle>
            <Activity className="h-6 w-6 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{stats?.totalConsultations || 0}</div>
            <p className="text-sm text-gray-500">Consultations réalisées</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">Activités</CardTitle>
            <Building2 className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{stats?.totalActivities || 0}</div>
            <p className="text-sm text-gray-500">Actions enregistrées</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">Alertes</CardTitle>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">0</div>
            <p className="text-sm text-gray-500">Alertes en attente</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-lg bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivities?.length ? stats.recentActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-gray-800">
                    {activity.utilisateur?.prenom} {activity.utilisateur?.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {format(new Date(activity.dateAction), 'PPp', { locale: fr })}
                </div>
              </div>
            )) : <div className="text-gray-400 text-sm">Aucune activité récente</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 