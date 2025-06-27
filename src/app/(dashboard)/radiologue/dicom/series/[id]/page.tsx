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
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
  Database,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface DicomInstance {
  id: string;
  sopInstanceUID: string;
  instanceNumber: string;
  imageType: string;
  url: string;
  thumbnailUrl?: string;
}

interface DicomSeries {
  id: string;
  seriesInstanceUID: string;
  seriesNumber: string;
  seriesDescription: string;
  modality: string;
  numberOfInstances: number;
  studyInstanceUID: string;
  studyDescription?: string;
  patientName?: string;
  patientID?: string;
  studyDate?: string;
}

export default function SeriesDetail() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  
  const [series, setSeries] = useState<DicomSeries | null>(null);
  const [instances, setInstances] = useState<DicomInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<DicomInstance | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (seriesId) {
      fetchSeriesDetails();
      fetchInstances();
    }
  }, [seriesId]);

  const fetchSeriesDetails = async () => {
    try {
      const response = await api.get(`/dicom/series/${seriesId}`);
      setSeries(response.data);
    } catch (error) {
      console.error('Error fetching series details:', error);
    }
  };

  const fetchInstances = async () => {
    try {
      const response = await api.get(`/dicom/series/${seriesId}/instances`);
      const instancesData = Array.isArray(response.data) ? response.data : 
                           (response.data?.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setInstances(instancesData);
      if (instancesData.length > 0) {
        setSelectedInstance(instancesData[0]);
        setCurrentImageIndex(0);
      }
    } catch (error) {
      console.error('Error fetching instances:', error);
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInstanceSelect = (instance: DicomInstance, index: number) => {
    setSelectedInstance(instance);
    setCurrentImageIndex(index);
  };

  const nextImage = () => {
    if (currentImageIndex < instances.length - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setSelectedInstance(instances[nextIndex]);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedInstance(instances[prevIndex]);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}/${month}/${year}`;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/radiologue/dicom">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Série {series?.seriesNumber} - {series?.seriesDescription || 'Sans description'}
            </h1>
            <p className="text-gray-600">Visualisation des images DICOM</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{series?.modality}</Badge>
          <Badge variant="secondary">{instances.length} images</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Visualiseur d'image</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentImageIndex + 1} / {instances.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    disabled={currentImageIndex === instances.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedInstance ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-96">
                    <img
                      src={selectedInstance.url}
                      alt={`Image ${selectedInstance.instanceNumber}`}
                      className="max-w-full max-h-96 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Instance {selectedInstance.instanceNumber}</span>
                    <span>SOP Instance UID: {selectedInstance.sopInstanceUID}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Aucune image sélectionnée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Series Info and Instance List */}
        <div className="space-y-6">
          {/* Series Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de la série</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Numéro de série</label>
                <p className="text-sm text-gray-900">{series?.seriesNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-900">{series?.seriesDescription || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Modalité</label>
                <p className="text-sm text-gray-900">{series?.modality}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre d'images</label>
                <p className="text-sm text-gray-900">{series?.numberOfInstances}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">UID de série</label>
                <p className="text-sm text-gray-900 font-mono text-xs break-all">{series?.seriesInstanceUID}</p>
              </div>
            </CardContent>
          </Card>

          {/* Study Information */}
          {series?.patientName && (
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'étude</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient</label>
                  <p className="text-sm text-gray-900">{series.patientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Patient</label>
                  <p className="text-sm text-gray-900">{series.patientID}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date d'étude</label>
                  <p className="text-sm text-gray-900">{formatDate(series.studyDate || '')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description de l'étude</label>
                  <p className="text-sm text-gray-900">{series.studyDescription || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instance List */}
          <Card>
            <CardHeader>
              <CardTitle>Images de la série</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(Array.isArray(instances) ? instances : []).map((instance, index) => (
                  <div
                    key={instance.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedInstance?.id === instance.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleInstanceSelect(instance, index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Instance {instance.instanceNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {instance.imageType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 