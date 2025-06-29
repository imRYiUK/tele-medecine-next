"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  User, 
  Calendar, 
  Image as ImageIcon,
  Upload,
  X,
  Plus,
  ArrowLeft,
  Save,
  Eye
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Patient {
  patientID: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
}

interface TypeExamen {
  typeExamenID: string;
  nom: string;
  categorie: string;
  description: string;
}

interface Dossier {
  dossierID: string;
  nom: string;
  description?: string;
}

type ExamFormData = Omit<{
  patientID: string;
  typeExamenID: string;
  dateExamen: string;
  description: string;
  dossierId: string;
}, never>;

interface UploadedImage {
  id?: string;
  file: File;
  description: string;
  type: string;
  preview?: string;
}

export default function NouvelExamen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [examTypes, setExamTypes] = useState<TypeExamen[]>([]);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<ExamFormData>({
    patientID: "",
    typeExamenID: "",
    dateExamen: new Date().toISOString().split('T')[0],
    description: "",
    dossierId: "",
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<TypeExamen | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-select patient if patientID is in query params
  useEffect(() => {
    const patientIDFromQuery = searchParams.get("patientID");
    if (patientIDFromQuery && patients.length > 0) {
      setFormData((prev) => ({ ...prev, patientID: patientIDFromQuery }));
      const patient = patients.find((p) => p.patientID === patientIDFromQuery);
      setSelectedPatient(patient || null);
      fetchDossierForPatient(patientIDFromQuery);
    }
  }, [searchParams, patients]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch patients from localhost:3001/api/patients
      const patientsResponse = await api.get('/patients');
      
      // Remove duplicates based on patientID
      const uniquePatients = patientsResponse.data.filter((patient: Patient, index: number, self: Patient[]) => 
        index === self.findIndex((p) => p.patientID === patient.patientID)
      );
      
      setPatients(uniquePatients);

      // Fetch exam types from localhost:3001/api/examens-medicaux/types
      const examTypesResponse = await api.get('/examens-medicaux/types');
      
      // Remove duplicates based on nom and categorie combination
      const uniqueExamTypes = examTypesResponse.data.filter((examType: TypeExamen, index: number, self: TypeExamen[]) => 
        index === self.findIndex((t) => t.nom === examType.nom && t.categorie === examType.categorie)
      );
      
      setExamTypes(uniqueExamTypes);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDossierForPatient = async (patientID: string) => {
    if (!patientID) {
      setDossier(null);
      setFormData((prev) => ({ ...prev, dossierId: "" }));
      return;
    }
    try {
      // Try to fetch the medical record for the selected patient
      const dossierResponse = await api.get(`/patients/${patientID}/medical-record`);
      setDossier(dossierResponse.data);
      setFormData((prev) => ({ ...prev, dossierId: dossierResponse.data.dossierID }));
    } catch (error) {
      setDossier(null);
      setFormData((prev) => ({ ...prev, dossierId: "" }));
      // Optionally handle 404 (no dossier for patient)
    }
  };

  const handlePatientChange = (patientID: string) => {
    setFormData({ ...formData, patientID });
    const patient = patients.find(p => p.patientID === patientID);
    setSelectedPatient(patient || null);
    fetchDossierForPatient(patientID);
  };

  const handleExamTypeChange = (typeExamenID: string) => {
    setFormData({ ...formData, typeExamenID });
    const examType = examTypes.find(t => t.typeExamenID === typeExamenID);
    setSelectedExamType(examType || null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files).map(file => ({
      file,
      description: `Image ${uploadedImages.length + 1}`,
      type: 'DICOM',
      preview: undefined, // DICOM files don't have previews
    }));

    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  const updateImageDescription = (index: number, description: string) => {
    const newImages = [...uploadedImages];
    newImages[index].description = description;
    setUploadedImages(newImages);
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

  const uploadDicomToOrthanc = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/dicom/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    //alert(JSON.stringify(response.data));
    return response.data.data; // contains orthancId, studyInstanceUID, etc.
  };

  const registerDicomImage = async ({
    examId,
    orthancMeta,
    description
  }: {
    examId: string,
    orthancMeta: any,
    description: string
  }) => {
    
    const url = `/dicom/wado/${orthancMeta.ID}?contentType=image/jpeg`;
    //alert(orthancMeta.ParentStudy + " " + orthancMeta.ParentSeries + " " + orthancMeta.ID + " " + orthancMeta.modality + " " + orthancMeta.acquisitionDate);
  
    const payload = {
      examenID: examId,
      studyInstanceUID: orthancMeta.ParentStudy,
      seriesInstanceUID: orthancMeta.ParentSeries,
      sopInstanceUID: orthancMeta.ID,
      modalite: orthancMeta.modality,
      dateAcquisition: orthancMeta.acquisitionDate,
      description,
      url
    };

    //alert(JSON.stringify(payload));

    await api.post('/examens-medicaux/images', payload);
  };

  const handleSubmit = async () => {
    if (!formData.patientID || !formData.typeExamenID || !formData.dateExamen || !formData.dossierId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);

      // Create the exam at localhost:3001/api/examens-medicaux
      const examResponse = await api.post('/examens-medicaux', {
        patientID: formData.patientID,
        typeExamenID: formData.typeExamenID,
        dateExamen: new Date(formData.dateExamen),
        description: formData.description,
        dossierID: formData.dossierId,
      });

      const examData = examResponse.data;
      const examId = examData.examenID;

      // Upload images to localhost:3001/api/examens-medicaux/images
      if (uploadedImages.length > 0) {
        setUploading(true);
        
        for (const image of uploadedImages) {
          try {
            // Step 1: Upload DICOM to Orthanc
            const orthancMeta = await uploadDicomToOrthanc(image.file);

            // Step 2: Register image with exam
            await registerDicomImage({
              examId,
              orthancMeta,
              description: image.description
            });
          } catch (error) {
            console.error('Erreur lors de l\'upload de l\'image:', image.description, error);
          }
        }
      }

      // Redirect to the exam detail page
      router.push(`/radiologue/examens/${examId}`);
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Erreur lors de la création de l\'examen');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
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
          <Link href="/radiologue/examens">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvel examen</h1>
            <p className="text-gray-600">Créer un nouvel examen radiologique</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Informations de l'examen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dossier Display */}
              <div>
                <Label>Dossier médical</Label>
                {dossier ? (
                  <div className="p-2 border rounded bg-gray-50">
                    <div className="font-medium">{dossier.nom || 'Dossier médical'}</div>
                    {dossier.description && <div className="text-sm text-gray-500">{dossier.description}</div>}
                    <div className="text-xs text-gray-400 mt-1">ID: {dossier.dossierID}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Aucun dossier médical trouvé pour ce patient.</div>
                )}
              </div>

              {/* Patient Selection */}
              <div>
                <Label htmlFor="patient">Patient *</Label>
                <Select value={formData.patientID} onValueChange={handlePatientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.patientID} value={patient.patientID}>
                        {patient.prenom} {patient.nom} ({calculateAge(patient.dateNaissance)} ans)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exam Type Selection */}
              <div>
                <Label htmlFor="examType">Type d'examen *</Label>
                <Select value={formData.typeExamenID} onValueChange={handleExamTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type d'examen" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map((examType) => (
                      <SelectItem key={examType.typeExamenID} value={examType.typeExamenID}>
                        <div className="flex flex-col">
                          <span className="font-medium">{examType.nom}</span>
                          <span className="text-xs text-gray-500">{examType.categorie}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exam Date */}
              <div>
                <Label htmlFor="dateExamen">Date d'examen *</Label>
                <Input
                  id="dateExamen"
                  type="date"
                  value={formData.dateExamen}
                  onChange={(e) => setFormData({ ...formData, dateExamen: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de l'examen..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          {selectedPatient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informations patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Nom:</span>
                    <p className="text-gray-900">{selectedPatient.prenom} {selectedPatient.nom}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Âge:</span>
                    <p className="text-gray-900">{calculateAge(selectedPatient.dateNaissance)} ans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exam Type Information */}
          {selectedExamType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Type d'examen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-500">Nom:</span>
                    <p className="text-gray-900">{selectedExamType.nom}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Catégorie:</span>
                    <Badge variant="outline">{selectedExamType.categorie}</Badge>
                  </div>
                  {selectedExamType.description && (
                    <div>
                      <span className="font-medium text-gray-500">Description:</span>
                      <p className="text-gray-900 text-sm">{selectedExamType.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Images Upload */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Images associées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  multiple
                  accept=".dcm"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Ajouter des images
                    </span>
                  </Button>
                </label>
              </div>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Images sélectionnées ({uploadedImages.length})
                  </h4>
                  <div className="space-y-3">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          {image.preview ? (
                            <img
                              src={image.preview}
                              alt={image.description}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              value={image.description}
                              onChange={(e) => updateImageDescription(index, e.target.value)}
                              placeholder="Description de l'image"
                              className="mb-2"
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {image.file.name} ({(image.file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                              <Badge variant="outline">DICOM</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={submitting || uploading || !formData.patientID || !formData.typeExamenID}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Upload des images...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer l'examen
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 