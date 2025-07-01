"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Eye,
  Calendar,
  Database
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { radiologistApi } from "@/lib/api/radiologist";

interface DashboardStats {
  examensEnAttente: number;
  examensEnCours: number;
  examensTermines: number;
  examensUrgents: number;
}

interface RecentExam {
  examenID: string;
  patient: {
    nom: string;
    prenom: string;
  };
  typeExamen: {
    nomType: string;
  };
  dateExamen: string;
  estAnalyse: boolean;
  description: string;
}

export default function RadiologueDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentExams, setRecentExams] = useState<RecentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [collaborations, setCollaborations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch statistics from localhost:3001/api/examens-medicaux/radiologue/statistiques
        const statsResponse = await api.get('/examens-medicaux/radiologue/statistiques');
        setStats(statsResponse.data);

        // Fetch recent exams from localhost:3001/api/examens-medicaux/radiologue/examens-recents
        const recentResponse = await api.get('/examens-medicaux/radiologue/examens-recents');
        setRecentExams(recentResponse.data);

        // Fetch real collaborations
        const collaborationsResponse = await radiologistApi.getUserCollaborations();
        setCollaborations(collaborationsResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (estAnalyse: boolean, description: string) => {
    // Check if urgent based on description
    const isUrgent = description.toLowerCase().includes('urgent') || description.toLowerCase().includes('critique');
    
    if (isUrgent) {
      return <Badge variant="destructive">Urgent</Badge>;
    }
    
    if (estAnalyse) {
      return <Badge variant="default">Analysé</Badge>;
    } else {
      return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de vos examens radiologiques</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.examensEnAttente || 0}</div>
            <p className="text-xs text-muted-foreground">Examens en attente d'analyse</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.examensTermines || 0}</div>
            <p className="text-xs text-muted-foreground">Examens analysés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.examensUrgents || 0}</div>
            <p className="text-xs text-muted-foreground">Examens urgents</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exams */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Examens récents</CardTitle>
            <Link href="/radiologue/examens">
              <Button variant="outline" size="sm">
                Voir tous
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun examen récent</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentExams.map((exam, index) => (
                <div
                  key={exam.examenID || `exam-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {exam.patient.prenom} {exam.patient.nom}
                      </h3>
                      <p className="text-sm text-gray-500">{exam.typeExamen.nomType}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(exam.dateExamen)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(exam.estAnalyse, exam.description)}
                    <Link href={`/radiologue/examens/${exam.examenID}`}>
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

      {/* Collaborations récentes en full width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collaborations récentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Examen</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Collaborateur</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {collaborations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-400">Aucune collaboration récente</td>
                  </tr>
                ) : (
                  collaborations.slice(0, 5).map((collab: any) => (
                    <tr key={collab.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{collab.image?.examen?.patient?.prenom} {collab.image?.examen?.patient?.nom}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{collab.image?.examen?.typeExamen?.nomType}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{collab.invitee?.nom} {collab.invitee?.prenom}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Badge variant={collab.status === 'ACCEPTED' ? 'default' : collab.status === 'PENDING' ? 'secondary' : 'destructive'}>
                          {collab.status === 'ACCEPTED' ? 'Acceptée' : collab.status === 'PENDING' ? 'En cours' : 'Rejetée'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Link href="/radiologue/collaborations">
                          <Button size="sm" variant="outline">Voir</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 