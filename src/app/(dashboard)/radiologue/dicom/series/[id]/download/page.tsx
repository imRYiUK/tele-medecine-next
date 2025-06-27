"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  FileArchive,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";

interface DicomInstance {
  ID: string;
  MainDicomTags?: {
    InstanceNumber?: string;
    SOPInstanceUID?: string;
    ImageComments?: string;
    AcquisitionDate?: string;
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
  };
  Instances?: string[];
  ParentStudy?: string;
}

export default function SeriesDownloadPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  
  const [series, setSeries] = useState<DicomSeries | null>(null);
  const [instances, setInstances] = useState<DicomInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seriesId) {
      fetchSeriesDetails();
      fetchInstances();
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
      
      const mappedInstances = instancesData.map((instance: any) => ({
        ID: instance.ID,
        MainDicomTags: instance.MainDicomTags || {},
      }));

      mappedInstances.sort((a: DicomInstance, b: DicomInstance) => 
        parseInt(a.MainDicomTags?.InstanceNumber || '0') - parseInt(b.MainDicomTags?.InstanceNumber || '0')
      );

      setInstances(mappedInstances);
    } catch (error) {
      console.error('Error fetching instances:', error);
      setError('Failed to load instances');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSeries = async () => {
    if (!series || instances.length === 0) return;

    try {
      setDownloading(true);
      setDownloadProgress(0);
      setError(null);

      // Create a ZIP file with all instances
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Download each instance and add to ZIP
      for (let i = 0; i < instances.length; i++) {
        const instance = instances[i];
        try {
          const response = await api.get(`/dicom/instances/${instance.ID}/file`, {
            responseType: 'arraybuffer',
          });

          const fileName = `instance_${(instance.MainDicomTags?.InstanceNumber || '0').padStart(3, '0')}.dcm`;
          zip.file(fileName, response.data);

          // Update progress
          setDownloadProgress(((i + 1) / instances.length) * 100);
        } catch (error) {
          console.error(`Error downloading instance ${instance.ID}:`, error);
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `series_${series.MainDicomTags?.SeriesNumber}_${series.MainDicomTags?.Modality}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error creating ZIP file:', error);
      setError('Failed to create download file');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDownloadInstance = async (instanceId: string, instanceNumber: string) => {
    try {
      const response = await api.get(`/dicom/instances/${instanceId}/file`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `instance_${instanceNumber.padStart(3, '0')}.dcm`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading instance:', error);
      setError('Failed to download instance');
    }
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
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-300" />
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
              Télécharger la série {series?.MainDicomTags?.SeriesNumber}
            </h1>
            <p className="text-gray-600">
              {instances.length} images • {series?.MainDicomTags?.Modality}
            </p>
          </div>
        </div>
      </div>

      {/* Series Info */}
      {series && (
        <Card>
          <CardHeader>
            <CardTitle>Informations de la série</CardTitle>
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
                <label className="text-sm font-medium text-gray-500">UID de série</label>
                <p className="text-sm text-gray-900 font-mono text-xs">{series.MainDicomTags?.SeriesInstanceUID}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download All */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileArchive className="mr-2 h-5 w-5" />
              Télécharger toute la série
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Téléchargez toutes les images de la série dans un fichier ZIP.
            </p>
            
            {downloading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Téléchargement en cours...</span>
                  <span>{Math.round(downloadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleDownloadSeries}
              disabled={downloading || instances.length === 0}
              className="w-full"
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger ZIP ({instances.length} fichiers)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Individual Downloads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Télécharger individuellement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Téléchargez des images spécifiques de la série.
            </p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {instances.map((instance) => (
                <div
                  key={instance.ID}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
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
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInstance(instance.ID, instance.MainDicomTags?.InstanceNumber || '0')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Le fichier ZIP contiendra tous les fichiers DICOM de la série</p>
            <p>• Les fichiers sont nommés selon leur numéro d'instance</p>
            <p>• Vous pouvez également télécharger des images individuelles</p>
            <p>• Les fichiers DICOM peuvent être ouverts avec des logiciels spécialisés</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 