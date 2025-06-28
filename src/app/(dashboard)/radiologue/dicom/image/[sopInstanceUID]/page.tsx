"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  Maximize,
  Info,
  Users,
  Calendar,
  User
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { radiologistApi } from "@/lib/api/radiologist";
import DicomViewer from "@/components/DicomViewer";
import ImageCollaboration from "@/components/ImageCollaboration";

interface ImageDetails {
  imageID: string;
  sopInstanceUID: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  dateAcquisition: string;
  modalite: string;
  description: string;
  url?: string;
  orthancInstanceId?: string;
  examen: {
    examenID: string;
    patient: {
      nom: string;
      prenom: string;
      dateNaissance: string;
      genre: string;
    };
    typeExamen: {
      nomType: string;
      description: string;
    };
    demandePar: {
      nom: string;
      prenom: string;
      email: string;
    };
  };
}

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sopInstanceUID = params.sopInstanceUID as string;
  
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    if (sopInstanceUID) {
      fetchImageDetails();
      fetchCurrentUser();
    }
  }, [sopInstanceUID]);

  const fetchImageDetails = async () => {
    try {
      setLoading(true);
      // First, get the image details by SOP Instance UID
      const imageResponse = await api.get(`/examens-medicaux/images/sop/${sopInstanceUID}`);
      const imageData = imageResponse.data;
      
      // Then, get the full exam details including patient info
      const examResponse = await api.get(`/examens-medicaux/${imageData.examenID}`);
      const examData = examResponse.data;
      
      // Combine the data
      const combinedData: ImageDetails = {
        ...imageData,
        examen: examData
      };
      
      setImageDetails(combinedData);
    } catch (error) {
      console.error('Error fetching image details:', error);
      setError('Failed to load image details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/profile/me');
      setCurrentUserId(response.data?.utilisateurID || '');
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleDownloadImage = async () => {
    if (!imageDetails?.sopInstanceUID) {
      console.error('No SOP Instance UID available for download');
      return;
    }

    try {
      const response = await api.get(`/dicom/collaborative/instances/${imageDetails.sopInstanceUID}/file`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dicom-image-${imageDetails.sopInstanceUID}.dcm`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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

  if (error || !imageDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Erreur lors du chargement de l'image</p>
              <p className="text-gray-500 text-sm">{error || 'Image non trouvée'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Image DICOM</h1>
            <p className="text-gray-600">{imageDetails.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDownloadImage}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Visualisation DICOM</span>
                <Badge variant="outline">{imageDetails.modalite}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {imageDetails.sopInstanceUID ? (
                  <DicomViewer
                    imageUrl={`/dicom/collaborative/instances/${imageDetails.sopInstanceUID}/preview?quality=90`}
                    instanceId={imageDetails.sopInstanceUID}
                    onError={(error) => console.error('DICOM viewer error:', error)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Aperçu non disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Informations patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Nom complet</label>
                <p className="font-medium">
                  {imageDetails.examen.patient.prenom} {imageDetails.examen.patient.nom}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date de naissance</label>
                <p>{formatDate(imageDetails.examen.patient.dateNaissance)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Genre</label>
                <p>{imageDetails.examen.patient.genre}</p>
              </div>
            </CardContent>
          </Card>

          {/* Exam Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Informations examen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Type d'examen</label>
                <p className="font-medium">{imageDetails.examen.typeExamen.nomType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Description</label>
                <p className="text-sm">{imageDetails.examen.typeExamen.description}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Demandé par</label>
                <p>{imageDetails.examen.demandePar.prenom} {imageDetails.examen.demandePar.nom}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date d'acquisition</label>
                <p>{formatDate(imageDetails.dateAcquisition)}</p>
              </div>
            </CardContent>
          </Card>

          {/* DICOM Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Métadonnées DICOM
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">SOP Instance UID</label>
                <p className="text-xs font-mono break-all">{imageDetails.sopInstanceUID}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Series Instance UID</label>
                <p className="text-xs font-mono break-all">{imageDetails.seriesInstanceUID}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Study Instance UID</label>
                <p className="text-xs font-mono break-all">{imageDetails.studyInstanceUID}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collaboration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageCollaboration
            imageId={imageDetails.imageID}
            sopInstanceUID={imageDetails.sopInstanceUID}
            currentUserId={currentUserId}
          />
        </CardContent>
      </Card>
    </div>
  );
} 