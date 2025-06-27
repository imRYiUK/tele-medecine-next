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
  Eye
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

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

  useEffect(() => {
    if (examId) {
      fetchExamDetails();
      fetchImages();
    }
  }, [examId]);

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Examen non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/radiologue/examens">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Examen - {exam.patient.prenom} {exam.patient.nom}
            </h1>
            <p className="text-gray-600">{exam.typeExamen.nom}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(exam.statut, exam.urgent)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informations patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nom complet</label>
                <p className="text-sm text-gray-900">
                  {exam.patient.prenom} {exam.patient.nom}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Âge</label>
                <p className="text-sm text-gray-900">
                  {calculateAge(exam.patient.dateNaissance)} ans
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                <p className="text-sm text-gray-900">{exam.patient.telephone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{exam.patient.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Détails de l'examen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Type d'examen</label>
                <p className="text-sm text-gray-900">{exam.typeExamen.nom}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Catégorie</label>
                <p className="text-sm text-gray-900">{exam.typeExamen.categorie}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-sm text-gray-900">{formatDate(exam.dateExamen)}</p>
              </div>
              {exam.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{exam.description}</p>
                </div>
              )}
              {exam.resultat && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Résultat</label>
                  <p className="text-sm text-gray-900 bg-green-50 p-2 rounded">
                    {exam.resultat}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Radiologues impliqués
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exam.radiologues.map((radiologue) => (
                  <div key={radiologue.id} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-900">
                      {radiologue.prenom} {radiologue.nom}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Images and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Images ({images.length})
                </CardTitle>
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
                    <Button disabled={uploading} size="sm" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Ajouter'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Aucune image disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                        selectedImage?.id === image.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleImageSelect(image)}
                    >
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full h-32 object-cover rounded"
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Analyse radiologique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Entrez votre analyse radiologique..."
                  value={analysisResult}
                  onChange={(e) => setAnalysisResult(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={markAsAnalyzed}
                  disabled={!analysisResult.trim()}
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer comme analysé
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Chat */}
          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Discussion - {selectedImage.description}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {message.sender.prenom[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {message.sender.prenom} {message.sender.nom}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 