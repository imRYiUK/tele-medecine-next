"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Save,
  X
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";

interface UserStats {
  totalExams: number;
  examsEnAttente: number;
  examsEnCours: number;
  examsTermines: number;
  examsUrgents: number;
  collaborationsActives: number;
}

export default function RadiologueProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Fetch statistics from localhost:3001/api/examens-medicaux/radiologue/statistiques
      const statsResponse = await api.get('/examens-medicaux/radiologue/statistiques');
      const statsData = statsResponse.data;
      
      // Fetch collaborations count from localhost:3001/api/examen-medical/images/user/collaborations
      const collaborationsResponse = await api.get('/examen-medical/images/user/collaborations');
      const collaborationsData = collaborationsResponse.data;
      
      setStats({
        ...statsData,
        collaborationsActives: collaborationsData.length,
        totalExams: (statsData.examensEnAttente || 0) + 
                    (statsData.examensEnCours || 0) + 
                    (statsData.examensTermines || 0) + 
                    (statsData.examensUrgents || 0)
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Update profile at localhost:3001/api/users/profile
      const response = await api.put('/users/profile', formData);

      if (response.data) {
        setEditing(false);
        // You might want to refresh user data here
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
    });
    setEditing(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600">Gestion de votre profil radiologue</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleCancel} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prenom">Prénom</Label>
                  {editing ? (
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{user?.prenom}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="nom">Nom</Label>
                  {editing ? (
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{user?.nom}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{user?.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  {editing ? (
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{user?.telephone}</p>
                  )}
                </div>
              </div>
              
              {!editing && (
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Radiologue</Badge>
                    <span className="text-sm text-gray-500">
                      Membre depuis N/A
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalExams || 0}</div>
                  <p className="text-sm text-gray-600">Total examens</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats?.examsEnCours || 0}</div>
                  <p className="text-sm text-gray-600">En cours</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.examsTermines || 0}</div>
                  <p className="text-sm text-gray-600">Terminés</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats?.collaborationsActives || 0}</div>
                  <p className="text-sm text-gray-600">Collaborations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aperçu rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">En attente</span>
                </div>
                <Badge variant="secondary">{stats?.examsEnAttente || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">En cours</span>
                </div>
                <Badge variant="default">{stats?.examsEnCours || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Terminés</span>
                </div>
                <Badge variant="outline">{stats?.examsTermines || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Urgents</span>
                </div>
                <Badge variant="destructive">{stats?.examsUrgents || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Voir mes examens
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Collaborations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Examens urgents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 