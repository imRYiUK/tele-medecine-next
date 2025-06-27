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
  Calendar,
  User,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface DicomStudy {
  ID: string;
  MainDicomTags?: {
    PatientName?: string;
    PatientID?: string;
    StudyDate?: string;
    StudyDescription?: string;
    ModalitiesInStudy?: string;
    StudyInstanceUID?: string;
  };
  Series?: string[];
  Instances?: string[];
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

export default function RadiologueDicom() {
  const [studies, setStudies] = useState<DicomStudy[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [series, setSeries] = useState<DicomSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dicom/studies');
      
      // Handle the case where we get an array of study IDs
      const studiesData = response.data?.data || [];
      
      if (Array.isArray(studiesData) && studiesData.length > 0 && typeof studiesData[0] === 'string') {
        // We have an array of study IDs, fetch details for each
        const studyDetails = await Promise.all(
          studiesData.map(async (studyId: string) => {
            try {
              const studyResponse = await api.get(`/dicom/studies/${studyId}`);
              return studyResponse.data?.data || studyResponse.data;
            } catch (error) {
              console.error(`Error fetching study ${studyId}:`, error);
              return null;
            }
          })
        );
        
        // Filter out any failed requests
        const validStudies = studyDetails.filter(study => study !== null);
        setStudies(validStudies);
      } else {
        // Direct array of study objects
        setStudies(studiesData);
      }
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
      // Handle the actual backend response structure
      const seriesData = response.data?.data || [];
      setSeries(seriesData);
    } catch (error) {
      console.error('Error fetching series:', error);
      setSeries([]); // Set empty array on error
    }
  };

  const handleStudySelect = (study: DicomStudy) => {
    setSelectedStudy(study);
    fetchSeries(study.ID);
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
    (study.MainDicomTags?.PatientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (study.MainDicomTags?.StudyDescription?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (study.MainDicomTags?.PatientID?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
                  key={study.ID}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedStudy?.ID === study.ID
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
                          {study.MainDicomTags?.StudyDescription || 'Étude sans description'}
                        </h3>
                        <Badge variant="outline">{study.MainDicomTags?.ModalitiesInStudy}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{study.MainDicomTags?.PatientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(study.MainDicomTags?.StudyDate || '')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{study.Series?.length || 0} séries</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>{study.Instances?.length || 0} images</span>
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
              Séries {selectedStudy ? `- ${selectedStudy.MainDicomTags?.StudyDescription}` : ''}
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
                {(Array.isArray(series) ? series : []).map((serie, index) => (
                  <div
                    key={serie.ID || `series-${index}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium text-gray-900">
                            Série {serie.MainDicomTags?.SeriesNumber}
                          </h3>
                          <Badge variant="outline">{serie.MainDicomTags?.Modality}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {serie.MainDicomTags?.SeriesDescription || 'Série sans description'}
                        </p>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <ImageIcon className="h-3 w-3" />
                          <span>{serie.Instances?.length || 0} images</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link href={`/radiologue/dicom/series/${serie.ID}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/radiologue/dicom/series/${serie.ID}/download`}>
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
                <p className="text-sm text-gray-900">{selectedStudy.MainDicomTags?.PatientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID Patient</label>
                <p className="text-sm text-gray-900">{selectedStudy.MainDicomTags?.PatientID}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date d'étude</label>
                <p className="text-sm text-gray-900">{formatDate(selectedStudy.MainDicomTags?.StudyDate || '')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-900">{selectedStudy.MainDicomTags?.StudyDescription || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Modalité</label>
                <p className="text-sm text-gray-900">{selectedStudy.MainDicomTags?.ModalitiesInStudy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">UID d'étude</label>
                <p className="text-sm text-gray-900 font-mono text-xs">{selectedStudy.MainDicomTags?.StudyInstanceUID}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 