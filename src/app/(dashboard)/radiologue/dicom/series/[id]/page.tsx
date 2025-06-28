"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  Download, 
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Settings,
  Info,
  Users
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import DicomViewer from "@/components/DicomViewer";
import ImageCollaboration from "@/components/ImageCollaboration";

interface DicomInstance {
  ID: string;
  MainDicomTags?: {
    InstanceNumber?: string;
    SOPInstanceUID?: string;
    ImageComments?: string;
    ImageType?: string;
    AcquisitionDate?: string;
    AcquisitionTime?: string;
  };
  ParentSeries?: string;
  ParentStudy?: string;
}

interface DicomSeries {
  ID: string;
  MainDicomTags?: {
    SeriesInstanceUID?: string;
    SeriesNumber?: string;
    SeriesDescription?: string;
    Modality?: string;
    SeriesDate?: string;
    SeriesTime?: string;
  };
  Instances?: string[];
  ParentStudy?: string;
}

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  
  const [series, setSeries] = useState<DicomSeries | null>(null);
  const [instances, setInstances] = useState<DicomInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<DicomInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    if (seriesId) {
      fetchSeriesDetails();
      fetchInstances();
      fetchCurrentUser();
    }
  }, [seriesId]);

  const fetchSeriesDetails = async () => {
    try {
      const response = await api.get(`/dicom/series/${seriesId}`);
      const seriesData = response.data?.data || response.data;
      setSeries(seriesData);
    } catch (error) {
      console.error('Error fetching series details:', error);
      setError('Failed to load series details');
    }
  };

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dicom/series/${seriesId}/instances`);
      const instancesData = response.data?.data || response.data || [];
      
      // Map the instances to our interface
      const mappedInstances = instancesData.map((instance: any) => ({
        ID: instance.ID,
        MainDicomTags: instance.MainDicomTags || {},
      }));

      // Sort by instance number
      mappedInstances.sort((a: DicomInstance, b: DicomInstance) => 
        parseInt(a.MainDicomTags?.InstanceNumber || '0') - parseInt(b.MainDicomTags?.InstanceNumber || '0')
      );

      setInstances(mappedInstances);
      
      // Set the first instance as selected
      if (mappedInstances.length > 0) {
        setSelectedInstance(mappedInstances[0]);
        setCurrentInstanceIndex(0);
      }
    } catch (error) {
      console.error('Error fetching instances:', error);
      setError('Failed to load instances');
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

  const handleInstanceSelect = (instance: DicomInstance, index: number) => {
    setSelectedInstance(instance);
    setCurrentInstanceIndex(index);
  };

  const handlePreviousInstance = () => {
    if (currentInstanceIndex > 0) {
      const newIndex = currentInstanceIndex - 1;
      setCurrentInstanceIndex(newIndex);
      setSelectedInstance(instances[newIndex]);
    }
  };

  const handleNextInstance = () => {
    if (currentInstanceIndex < instances.length - 1) {
      const newIndex = currentInstanceIndex + 1;
      setCurrentInstanceIndex(newIndex);
      setSelectedInstance(instances[newIndex]);
    }
  };

  const handleDownloadInstance = async (instanceId: string) => {
    try {
      const response = await api.get(`/dicom/instances/${instanceId}/file`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dicom-instance-${instanceId}.dcm`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading instance:', error);
    }
  };

  const filteredInstances = instances.filter(instance =>
    instance.MainDicomTags?.InstanceNumber?.includes(searchTerm) ||
    (instance.MainDicomTags?.ImageComments || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (error) {
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
              <p className="text-red-600 mb-2">Erreur lors du chargement</p>
              <p className="text-sm text-gray-500">{error}</p>
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
            <h1 className="text-2xl font-bold text-gray-900">
              Série {series?.MainDicomTags?.SeriesNumber} - {series?.MainDicomTags?.SeriesDescription || 'Sans description'}
            </h1>
            <p className="text-gray-600">
              {instances.length} images • {series?.MainDicomTags?.Modality}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Series Info */}
      {series && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Informations de la série
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Numéro de série</label>
                <p className="text-sm text-gray-900">{series.MainDicomTags?.SeriesNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Modalité</label>
                <p className="text-sm text-gray-900">{series.MainDicomTags?.Modality}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre d'images</label>
                <p className="text-sm text-gray-900">{series.Instances?.length || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-900">{series.MainDicomTags?.SeriesDescription || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date de série</label>
                <p className="text-sm text-gray-900">
                  {formatDate(series.MainDicomTags?.SeriesDate || '')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">UID de série</label>
                <p className="text-sm text-gray-900 font-mono text-xs">{series.MainDicomTags?.SeriesInstanceUID}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Rechercher des images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par numéro d'image ou commentaires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
        {/* Instances List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>
              Images ({filteredInstances.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="space-y-2 h-full overflow-y-auto">
              {filteredInstances.map((instance, index) => (
                <div
                  key={instance.ID}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedInstance?.ID === instance.ID
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleInstanceSelect(instance, index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{instance.MainDicomTags?.InstanceNumber}</Badge>
                        {instance.MainDicomTags?.ImageComments && (
                          <span className="text-xs text-gray-500 truncate">
                            {instance.MainDicomTags.ImageComments}
                          </span>
                        )}
                      </div>
                      {instance.MainDicomTags?.AcquisitionDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(instance.MainDicomTags.AcquisitionDate)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadInstance(instance.ID);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DICOM Viewer and Collaboration */}
        <div className="lg:col-span-3 flex flex-col space-y-6 h-full">
          {/* DICOM Viewer */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center justify-between">
                <span>
                  Image {selectedInstance?.MainDicomTags?.InstanceNumber} 
                  {selectedInstance && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({currentInstanceIndex + 1} sur {instances.length})
                    </span>
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousInstance}
                    disabled={currentInstanceIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextInstance}
                    disabled={currentInstanceIndex === instances.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {selectedInstance ? (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1 min-h-0">
                    <DicomViewer
                      imageUrl={`dicom/instances/${selectedInstance.ID}/preview?quality=90`}
                      instanceId={selectedInstance.ID}
                      onError={(error) => console.error('DICOM viewer error:', error)}
                    />
                  </div>
                  
                  {/* Instance Details */}
                  <div className="flex-shrink-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="text-gray-500">Numéro d'image</label>
                        <p className="font-medium">{selectedInstance.MainDicomTags?.InstanceNumber}</p>
                      </div>
                      <div>
                        <label className="text-gray-500">UID SOP</label>
                        <p className="font-mono text-xs truncate">{selectedInstance.MainDicomTags?.SOPInstanceUID}</p>
                      </div>
                      {selectedInstance.MainDicomTags?.AcquisitionDate && (
                        <div>
                          <label className="text-gray-500">Date d'acquisition</label>
                          <p>{formatDate(selectedInstance.MainDicomTags.AcquisitionDate)}</p>
                        </div>
                      )}
                      {selectedInstance.MainDicomTags?.ImageType && (
                        <div>
                          <label className="text-gray-500">Type d'image</label>
                          <p className="text-xs">{selectedInstance.MainDicomTags.ImageType}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Sélectionnez une image pour la visualiser</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Collaboration */}
          {selectedInstance && currentUserId && (
            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageCollaboration
                  imageId={selectedInstance.ID}
                  sopInstanceUID={selectedInstance.ID}
                  currentUserId={currentUserId}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 