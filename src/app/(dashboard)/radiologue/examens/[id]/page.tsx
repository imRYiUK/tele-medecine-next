"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  User, 
  Calendar, 
  Image as ImageIcon,
  MessageSquare,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Download,
  Upload,
  Send,
  Eye,
  Lock
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { radiologistApi } from "@/lib/api/radiologist";

interface Exam {
  id: string;
  patient: {
    nom: string;
    prenom: string;
    dateNaissance: string;
    telephone: string;
    email: string;
  };
  typeExamen: {
    nom: string;
    categorie: string;
    description: string;
  };
  dateExamen: string;
  statut: string;
  urgent: boolean;
  description?: string;
  resultat?: string;
  radiologues: Array<{
    id: string;
    nom: string;
    prenom: string;
  }>;
}

interface MedicalImage {
  id: string;
  url: string;
  description: string;
  type: string;
  createdAt: string;
  radiologue: {
    nom: string;
    prenom: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    nom: string;
    prenom: string;
  };
  createdAt: string;
}

export default function RadiologueExamDetail() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<MedicalImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      fetchExamDetails();
      fetchImages();
      checkPermissions();
    }
  }, [examId]);

  const checkPermissions = async () => {
    try {
      setPermissionLoading(true);
      const hasPermission = await radiologistApi.canEditExam(examId);
      setCanEdit(hasPermission);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setCanEdit(false);
    } finally {
      setPermissionLoading(false);
    }
  };

  const fetchExamDetails = async () => {
    try {
      const response = await api.get(`/examens-medicaux/${examId}`);
      setExam(response.data);
    } catch (error) {
      console.error('Error fetching exam details:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await api.get(`/examens-medicaux/${examId}/images`);
      setImages(response.data);
      if (response.data.length > 0) {
        setSelectedImage(response.data[0]);
        fetchMessages(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (imageId: string) => {
    try {
      const response = await api.get(`/examen-medical/images/${imageId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleImageSelect = (image: MedicalImage) => {
    setSelectedImage(image);
    fetchMessages(image.id);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examenId', examId);
      formData.append('description', 'Image ajoutée par le radiologue');

      const response = await api.post('/examens-medicaux/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedImage || !newMessage.trim()) return;

    try {
      const response = await api.post(`/examen-medical/images/${selectedImage.id}/messages`, {
        content: newMessage,
      });

      if (response.data) {
        setNewMessage("");
        fetchMessages(selectedImage.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsAnalyzed = async () => {
    if (!analysisResult.trim()) return;

    try {
      const response = await api.put(`/examens-medicaux/${examId}/marquer-analyse`, {
        resultat: analysisResult,
      });

      if (response.data) {
        fetchExamDetails();
        setAnalysisResult("");
      }
    } catch (error) {
      console.error('Error marking as analyzed:', error);
    }
  };

  const inviteRadiologist = async (radiologistId: string) => {
    try {
      const response = await api.put(`/examens-medicaux/${examId}/invite-radiologue/${radiologistId}`);

      if (response.data) {
        fetchExamDetails();
      }
    } catch (error) {
      console.error('Error inviting radiologist:', error);
    }
  };

  const calculateAge = (dateNaissance: string) => {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  const getStatusBadge = (status: string, urgent: boolean) => {
    if (urgent) {
      return <Badge variant="destructive">Urgent</Badge>;
    }
    
    switch (status) {
      case 'EN_ATTENTE':
        return <Badge variant="secondary">En attente</Badge>;
      case 'EN_COURS':
        return <Badge variant="default">En cours</Badge>;
      case 'TERMINE':
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-white">
        <p className="text-gray-500">Examen non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-2 sm:px-6 lg:px-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/radiologue/examens">
            <Button variant="outline" size="sm" className="rounded-full shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
              Examen - {exam.patient.prenom} {exam.patient.nom}
            </h1>
            <p className="text-blue-700 font-medium">{exam.typeExamen.nom}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(exam.statut, exam.urgent)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exam Details */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800 text-lg font-semibold">
                <User className="mr-2 h-5 w-5 text-blue-400" />
                Informations patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom complet</label>
                <p className="text-base text-gray-900 font-medium">
                  {exam.patient.prenom} {exam.patient.nom}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Âge</label>
                <p className="text-base text-gray-900 font-medium">
                  {calculateAge(exam.patient.dateNaissance)} ans
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</label>
                <p className="text-base text-gray-900 font-medium">{exam.patient.telephone}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-base text-gray-900 font-medium">{exam.patient.email}</p>
              </div>
            </CardContent>
          </Card>

          <div className="border-t border-gray-200 my-4" />

          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800 text-lg font-semibold">
                <FileText className="mr-2 h-5 w-5 text-blue-400" />
                Détails de l'examen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type d'examen</label>
                <p className="text-base text-gray-900 font-medium">{exam.typeExamen.nom}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</label>
                <p className="text-base text-gray-900 font-medium">{exam.typeExamen.categorie}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
                <p className="text-base text-gray-900 font-medium">{formatDate(exam.dateExamen)}</p>
              </div>
              {exam.description && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                  <p className="text-base text-gray-900 font-medium">{exam.description}</p>
                </div>
              )}
              {exam.resultat && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Résultat</label>
                  <p className="text-base text-green-800 bg-green-50 p-2 rounded font-medium">
                    {exam.resultat}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Images and Analysis */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-blue-800 text-lg font-semibold">
                  <ImageIcon className="mr-2 h-5 w-5 text-blue-400" />
                  Images <span className="ml-1 text-blue-500 font-bold">({images.length})</span>
                  {!permissionLoading && !canEdit && (
                    <Lock className="ml-2 h-4 w-4 text-gray-400" />
                  )}
                </CardTitle>
                {canEdit && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="image-upload">
                      <Button disabled={uploading} size="sm" asChild className="rounded-full">
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          {uploading ? 'Upload...' : 'Ajouter'}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
              {!permissionLoading && !canEdit && (
                <p className="text-sm text-gray-600 mt-2">
                  Vous ne pouvez pas ajouter d'images à cet examen
                </p>
              )}
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Aucune image disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={`border rounded-xl p-2 cursor-pointer transition-colors shadow-sm bg-white hover:shadow-md ${
                        selectedImage?.id === image.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleImageSelect(image)}
                    >
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full h-32 object-cover rounded-lg shadow"
                      />
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {image.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis */}
          {exam.statut !== 'TERMINE' && (
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800 text-lg font-semibold">
                  <CheckCircle className="mr-2 h-5 w-5 text-blue-400" />
                  Analyse radiologique
                  {!permissionLoading && !canEdit && (
                    <Lock className="ml-2 h-4 w-4 text-gray-400" />
                  )}
                </CardTitle>
                {!permissionLoading && !canEdit && (
                  <p className="text-sm text-gray-600 mt-2">
                    Vous n'avez pas les permissions pour modifier cet examen
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {canEdit ? (
                  <>
                    <Textarea
                      placeholder="Entrez votre analyse radiologique..."
                      value={analysisResult}
                      onChange={(e) => setAnalysisResult(e.target.value)}
                      rows={4}
                      className="rounded-lg border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <Button 
                      onClick={markAsAnalyzed}
                      disabled={!analysisResult.trim()}
                      className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer comme analysé
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      Lecture seule - Vous ne pouvez pas modifier cet examen
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 