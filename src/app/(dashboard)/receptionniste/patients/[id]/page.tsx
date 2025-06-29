"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { patientsService, Patient } from "@/lib/services/patients.service";
import { consultationMedicaleService } from "@/lib/services/consultation-medicale.service";
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle2, FileText, Stethoscope, FlaskConical, ArrowLeft, Droplets, BadgeInfo, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReceptionnistePatientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultationCount, setConsultationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData(id as string);
    }
  }, [id]);

  async function fetchData(patientID: string) {
    setLoading(true);
    try {
      const [patientData, countData] = await Promise.all([
        patientsService.getById(patientID),
        consultationMedicaleService.getConsultationCount(patientID),
      ]);
      setPatient(patientData);
      setConsultationCount(countData.count);
    } catch (error) {
      console.error('Erreur lors du fetch des données:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Patient introuvable.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-emerald-700">Informations Patient</h1>
      </div>

      <div className="grid gap-6">
        {/* Informations du patient */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Nom complet:</span>
                <p className="text-gray-900">{patient.prenom} {patient.nom}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date de naissance:</span>
                <p className="text-gray-900">{patient.dateNaissance}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{patient.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Téléphone:</span>
                <p className="text-gray-900">{patient.telephone}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Genre:</span>
                <p className="text-gray-900">{patient.genre}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Groupe sanguin:</span>
                <p className="text-gray-900">{patient.groupeSanguin}</p>
              </div>
            </div>
            {patient.adresse && (
              <div>
                <span className="font-medium text-gray-700">Adresse:</span>
                <p className="text-gray-900">{patient.adresse}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques des consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Statistiques médicales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-lg font-semibold text-emerald-900">
                    {consultationCount} consultation{consultationCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-emerald-700">
                    Nombre total de consultations effectuées
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 