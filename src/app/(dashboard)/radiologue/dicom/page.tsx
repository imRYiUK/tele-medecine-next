"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Database, 
  Search, 
  Eye, 
  Download, 
  Upload,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  Plus
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface DicomStudy {
  id: string;
  studyInstanceUID: string;
  patientName: string;
  patientID: string;
  studyDate: string;
  studyDescription: string;
  modality: string;
  numberOfSeries: number;
  numberOfInstances: number;
}

interface DicomSeries {
  id: string;
  seriesInstanceUID: string;
  seriesNumber: string;
  seriesDescription: string;
  modality: string;
  numberOfInstances: number;
}

export default function RadiologueDicom() {
  const [studies, setStudies] = useState<DicomStudy[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [series, setSeries] = useState<DicomSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dicom/studies');
      // Ensure we have an array, fallback to empty array if not
      const studiesData = Array.isArray(response.data) ? response.data : 
                         (response.data?.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setStudies(studiesData);
    } catch (error) {
      console.error('Error fetching DICOM studies:', error);
      setStudies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchSeries = async (studyId: string) => {
    try {
      const response = await api.get(`/dicom/studies/${studyId}/series`);
      // Ensure we have an array, fallback to empty array if not
      const seriesData = Array.isArray(response.data) ? response.data : 
                        (response.data?.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setSeries(seriesData);
    } catch (error) {
      console.error('Error fetching series:', error);
      setSeries([]); // Set empty array on error
    }
  };

  const handleStudySelect = (study: DicomStudy) => {
    // alert(study)
    setSelectedStudy(study);
    fetchSeries(study.id);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/dicom/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        fetchStudies();
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // DICOM dates are typically in YYYYMMDD format
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  // Ensure studies is always an array before filtering
  const filteredStudies = (Array.isArray(studies) ? studies : []).filter(study =>
    (study.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (study.studyDescription?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (study.patientID?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Images DICOM</h1>
          <p className="text-gray-600">Gestion des études et séries DICOM</p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".dcm"
            onChange={handleFileUpload}
            className="hidden"
            id="dicom-upload"
            disabled={uploading}
          />
          <label htmlFor="dicom-upload">
            <Button disabled={uploading} asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Upload...' : 'Upload DICOM'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Rechercher des études
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom patient, description ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Studies List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Études DICOM ({filteredStudies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredStudies.map((study) => (
                <div
                  key={study.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedStudy?.id === study.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleStudySelect(study)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900">
                          {study.studyDescription || 'Étude sans description'}
                        </h3>
                        <Badge variant="outline">{study.modality}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{study.patientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(study.studyDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{study.numberOfSeries} séries</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>{study.numberOfInstances} images</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Series List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Séries {selectedStudy ? `- ${selectedStudy.studyDescription}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedStudy ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez une étude pour voir ses séries</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(Array.isArray(series) ? series : []).map((serie) => (
                  <div
                    key={serie.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium text-gray-900">
                            Série {serie.seriesNumber}
                          </h3>
                          <Badge variant="outline">{serie.modality}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {serie.seriesDescription || 'Série sans description'}
                        </p>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <ImageIcon className="h-3 w-3" />
                          <span>{serie.numberOfInstances} images</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link href={`/radiologue/dicom/series/${serie.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/radiologue/dicom/series/${serie.id}/download`}>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Study Details */}
      {selectedStudy && (
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'étude</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Patient</label>
                <p className="text-sm text-gray-900">{selectedStudy.patientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID Patient</label>
                <p className="text-sm text-gray-900">{selectedStudy.patientID}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date d'étude</label>
                <p className="text-sm text-gray-900">{formatDate(selectedStudy.studyDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-900">{selectedStudy.studyDescription || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Modalité</label>
                <p className="text-sm text-gray-900">{selectedStudy.modality}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">UID d'étude</label>
                <p className="text-sm text-gray-900 font-mono text-xs">{selectedStudy.studyInstanceUID}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 