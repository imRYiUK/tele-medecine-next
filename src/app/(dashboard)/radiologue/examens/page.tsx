"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { radiologistApi } from "@/lib/api/radiologist";

interface Exam {
  id: string;
  patient: {
    nom: string;
    prenom: string;
    dateNaissance: string;
  };
  typeExamen: {
    nom: string;
    categorie: string;
  };
  dateExamen: string;
  statut: string;
  urgent: boolean;
  description?: string;
  resultat?: string;
  nombreImages: number;
  nombreRadiologues: number;
  canEdit?: boolean;
}

interface TypeExamen {
  typeExamenID: string;
  nomType: string;
  description: string;
  categorie: string;
}

export default function RadiologueExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examTypes, setExamTypes] = useState<TypeExamen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TOUS");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchExamTypes();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [statusFilter, categoryFilter, searchTerm]);

  const fetchExamTypes = async () => {
    try {
      const types = await radiologistApi.getTypeExamens();
      setExamTypes(types);
    } catch (error) {
      console.error('Error fetching exam types:', error);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "TOUS") params.status = statusFilter;
      if (categoryFilter !== "ALL") params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await radiologistApi.getRadiologistExamens(params);
      
      // Check permissions for each exam
      const examsWithPermissions = await Promise.all(
        response.map(async (exam: any) => {
          try {
            const canEdit = await radiologistApi.canEditExam(exam.examenID);
            return {
              id: exam.examenID,
              patient: {
                nom: exam.patientNom,
                prenom: exam.patientPrenom,
                dateNaissance: '', // Not provided
              },
              typeExamen: {
                nom: exam.typeExamenNom,
                categorie: exam.typeExamenCategorie,
              },
              dateExamen: exam.dateExamen,
              statut: exam.estAnalyse ? 'ANALYSE' : 'EN_ATTENTE',
              urgent: false, // Not provided
              description: exam.description,
              resultat: exam.resultat,
              nombreImages: exam.nombreImages,
              nombreRadiologues: Math.max(exam.nombreRadiologues, 1),
              canEdit,
            };
          } catch (error) {
            console.error(`Error checking permissions for exam ${exam.examenID}:`, error);
            return {
              id: exam.examenID,
              patient: {
                nom: exam.patientNom,
                prenom: exam.patientPrenom,
                dateNaissance: '',
              },
              typeExamen: {
                nom: exam.typeExamenNom,
                categorie: exam.typeExamenCategorie,
              },
              dateExamen: exam.dateExamen,
              statut: exam.estAnalyse ? 'ANALYSE' : 'EN_ATTENTE',
              urgent: false,
              description: exam.description,
              resultat: exam.resultat,
              nombreImages: exam.nombreImages,
              nombreRadiologues: Math.max(exam.nombreRadiologues, 1),
              canEdit: false, // Default to false if permission check fails
            };
          }
        })
      );
      
      setExams(examsWithPermissions);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, urgent: boolean) => {
    if (urgent) {
      return <Badge variant="destructive">Urgent</Badge>;
    }
    
    switch (status) {
      case 'EN_ATTENTE':
        return <Badge variant="secondary">En attente</Badge>;
      case 'ANALYSE':
        return <Badge variant="default">Analysé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  const calculateAge = (dateNaissance: string) => {
    if (!dateNaissance || dateNaissance.trim() === '') {
      return 'N/A';
    }
    
    const birthDate = new Date(dateNaissance);
    if (isNaN(birthDate.getTime())) {
      return 'N/A';
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
          <h1 className="text-2xl font-bold text-gray-900">Examens médicaux</h1>
          <p className="text-gray-600">Gestion des examens radiologiques</p>
        </div>
        <Link href="/radiologue/examens/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel examen
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOUS">Tous les statuts</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="ANALYSE">Analysé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes les catégories</SelectItem>
                {Array.from(new Set(examTypes.map(type => type.categorie))).map((categorie) => (
                  <SelectItem key={categorie} value={categorie}>
                    {categorie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {exams.length} examen{exams.length !== 1 ? 's' : ''} trouvé{exams.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun examen trouvé</p>
              <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exam.typeExamen?.nom || 'Type inconnu'}
                        </h3>
                        {getStatusBadge(exam.statut, exam.urgent)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {exam.patient?.prenom || 'Prénom inconnu'} {exam.patient?.nom || 'Nom inconnu'} ({calculateAge(exam.patient?.dateNaissance || '')}{calculateAge(exam.patient?.dateNaissance || '') !== 'N/A' ? ' ans' : ''})
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(exam.dateExamen)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {exam.nombreImages} image{exam.nombreImages !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {exam.nombreRadiologues} radiologue{exam.nombreRadiologues !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {exam.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {exam.description}
                        </p>
                      )}
                      
                      {exam.resultat && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <p className="text-sm text-green-800">
                            <strong>Résultat :</strong> {exam.resultat}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link href={`/radiologue/examens/${exam.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                      </Link>
                      {exam.canEdit ? (
                        <Link href={`/radiologue/examens/${exam.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <div className="flex items-center space-x-1 text-gray-400 text-xs">
                          <Lock className="h-3 w-3" />
                          <span>Lecture seule</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 