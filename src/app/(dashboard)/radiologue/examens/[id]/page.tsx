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
  Lock,
  Trash2
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
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

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
      setAccessDenied(false);
    } catch (error: any) {
      console.error('Error fetching exam details:', error);
      if (error.response?.status === 403) {
        setAccessDenied(true);
      }
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
      setAccessDenied(false);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      if (error.response?.status === 403) {
        setAccessDenied(true);
      }
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

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      setDeletingImage(imageId);
      await api.delete(`/examens-medicaux/images/${imageId}`);
      
      // Si l'image supprimée était sélectionnée, désélectionner
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
        setMessages([]);
      }
      
      // Recharger les images
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Erreur lors de la suppression de l\'image');
    } finally {
      setDeletingImage(null);
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
      case 'ANALYSE':
        return <Badge variant="default">Analysé</Badge>;
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

  if (accessDenied) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/radiologue/examens">
              <Button variant="outline" size="sm" className="rounded-full shadow-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
          </div>
          
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
              <Lock className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h2>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas la permission de consulter cet examen. 
                Vous devez être explicitement assigné à cet examen pour y avoir accès.
              </p>
              <Link href="/radiologue/examens">
                <Button className="w-full">
                  Retour aux examens
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
    <div className="bg-gradient-to-br from-blue-50 to-white py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/radiologue/examens">
              <Button variant="outline" size="sm" className="rounded-full shadow-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 tracking-tight">
                Examen - {exam.patient.prenom} {exam.patient.nom}
              </h1>
              <p className="text-blue-700 font-medium text-sm sm:text-base">{exam.typeExamen.nom}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(exam.statut, exam.urgent)}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Patient & Exam Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Patient Info */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-blue-800 text-base font-semibold">
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</span>
                  <span className="text-sm font-medium text-gray-900">
                    {exam.patient.prenom} {exam.patient.nom}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Âge</span>
                  <span className="text-sm font-medium text-gray-900">
                    {calculateAge(exam.patient.dateNaissance)} ans
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</span>
                  <span className="text-sm font-medium text-gray-900">{exam.patient.telephone}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{exam.patient.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Exam Details */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-blue-800 text-base font-semibold">
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  Examen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</span>
                  <span className="text-sm font-medium text-gray-900">{exam.typeExamen.nom}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</span>
                  <span className="text-sm font-medium text-gray-900">{exam.typeExamen.categorie}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(exam.dateExamen)}</span>
                </div>
                {exam.description && (
                  <div className="py-2 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Description</span>
                    <span className="text-sm text-gray-900">{exam.description}</span>
                  </div>
                )}
                {exam.resultat && (
                  <div className="py-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Résultat</span>
                    <span className="text-sm text-green-800 bg-green-50 p-2 rounded font-medium block">
                      {exam.resultat}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Images Section */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-blue-800 text-lg font-semibold">
                    <ImageIcon className="mr-2 h-5 w-5 text-blue-500" />
                    Images médicales
                    <span className="ml-2 text-blue-500 font-bold">({images.length})</span>
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
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Aucune image disponible</p>
                    <p className="text-sm">Ajoutez des images pour commencer l'analyse</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((image, index) => (
                      <div
                        key={image.id || `image-${index}`}
                        className={`group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                          selectedImage?.id === image.id
                            ? 'ring-2 ring-blue-500 shadow-lg'
                            : 'hover:ring-1 hover:ring-blue-300'
                        }`}
                        onClick={() => handleImageSelect(image)}
                      >
                        {/* Image Placeholder */}
                        <div className="relative h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
                          <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                              <ImageIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm">
                              <span className="text-sm font-semibold text-blue-700">#{index + 1}</span>
                            </div>
                          </div>
                          
                          {/* Selection Indicator */}
                          {selectedImage?.id === image.id && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Delete Button */}
                          {canEdit && (
                            <div className="absolute top-2 left-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 bg-gray-400/80 hover:bg-red-500 text-white rounded-full shadow-sm opacity-60 hover:opacity-100 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(image.id);
                                }}
                                disabled={deletingImage === image.id}
                              >
                                {deletingImage === image.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Image Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                            {image.description || `Image médicale ${index + 1}`}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              {image.type}
                            </span>
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Section */}
            {exam.statut !== 'TERMINE' && (
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-blue-800 text-lg font-semibold">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
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
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Observations et conclusions
                        </label>
                        <Textarea
                          placeholder="Décrivez vos observations radiologiques, anomalies détectées, et conclusions diagnostiques..."
                          value={analysisResult}
                          onChange={(e) => setAnalysisResult(e.target.value)}
                          rows={6}
                          className="rounded-lg border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={markAsAnalyzed}
                          disabled={!analysisResult.trim()}
                          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow px-8"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Finaliser l'analyse
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Lock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Lecture seule</p>
                      <p className="text-sm text-gray-400">Vous ne pouvez pas modifier cet examen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 