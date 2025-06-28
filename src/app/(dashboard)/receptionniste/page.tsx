"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  UserPlus,
  FileText,
  Eye,
  Plus,
  Search
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { receptionnisteService, ReceptionnisteStats } from "@/lib/services/receptionniste.service";
import { RendezVous } from "@/lib/services/rendez-vous.service";
import { Patient } from "@/lib/services/patients.service";

export default function ReceptionnisteDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReceptionnisteStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RendezVous[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await receptionnisteService.getDashboardData();
        setStats(dashboardData.stats);
        setRecentAppointments(dashboardData.recentAppointments);
        setRecentPatients(dashboardData.recentPatients);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentStatus = (appointment: RendezVous) => {
    const appointmentDateTime = new Date(appointment.dateHeure);
    const now = new Date();
    
    if (appointmentDateTime < now) {
      return <Badge variant="outline">Terminé</Badge>;
    } else if (appointmentDateTime.getTime() - now.getTime() < 30 * 60 * 1000) { // 30 minutes
      return <Badge variant="destructive">Urgent</Badge>;
    } else {
      return <Badge variant="default">À venir</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue, {user?.prenom} {user?.nom}. Vue d'ensemble de la gestion des patients et rendez-vous.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">Patients enregistrés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendez-vous Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.appointmentsToday || 0}</div>
            <p className="text-xs text-muted-foreground">Rendez-vous du jour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette Semaine</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.appointmentsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">Rendez-vous de la semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.pendingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Rendez-vous à venir</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/receptionniste/patients">
              <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Gérer les Patients</span>
              </Button>
            </Link>
            <Link href="/receptionniste/rendez-vous">
              <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>Gérer les Rendez-vous</span>
              </Button>
            </Link>
            <Link href="/receptionniste/patients?action=new">
              <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <UserPlus className="h-6 w-6" />
                <span>Nouveau Patient</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prochains Rendez-vous</CardTitle>
              <Link href="/receptionniste/rendez-vous">
                <Button variant="outline" size="sm">
                  Voir tous
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun rendez-vous à venir</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.rendezVousID}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Calendar className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {appointment.patient?.prenom} {appointment.patient?.nom}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {appointment.medecin?.prenom} {appointment.medecin?.nom}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(appointment.dateHeure)} à {formatTime(appointment.dateHeure)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getAppointmentStatus(appointment)}
                      <Link href={`/receptionniste/patients/${appointment.patient?.patientID}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patients Récents</CardTitle>
              <Link href="/receptionniste/patients">
                <Button variant="outline" size="sm">
                  Voir tous
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun patient enregistré</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.patientID}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {patient.prenom} {patient.nom}
                        </h3>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                        <p className="text-sm text-gray-500">{patient.telephone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/receptionniste/patients/${patient.patientID}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/receptionniste/rendez-vous?patientID=${patient.patientID}`}>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 