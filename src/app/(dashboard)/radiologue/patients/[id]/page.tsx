"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { patientsService, Patient } from "@/lib/services/patients.service";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, FileText, User, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Exam {
  examenID: string;
  dateExamen: string;
  description?: string;
  estAnalyse: boolean;
  typeExamen: {
    nomType: string;
    categorie: string;
  };
  demandePar: {
    nom: string;
    prenom: string;
    role: string;
  };
  images: any[];
  radiologues: Array<{
    utilisateurID: string;
    nom: string;
    prenom: string;
    email: string;
  }>;
}

export default function RadiologuePatientDetailPage() {
  const params = useParams();
  const patientID = params?.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientID) return;
    setLoading(true);
    Promise.all([
      patientsService.getById(patientID),
      api.get(`/examens-medicaux/patient/${patientID}`)
    ]).then(([patientData, examsRes]) => {
      setPatient(patientData);
      setExams(examsRes.data);
    }).finally(() => setLoading(false));
  }, [patientID]);

  return (
    <div className="space-y-6 p-6">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      ) : patient ? (
        <>
          {/* Patient Info Card */}
          <div className="bg-white rounded shadow p-4 border space-y-2">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">{patient.prenom} {patient.nom}</h2>
            <div>Email: {patient.email}</div>
            <div>Téléphone: {patient.telephone}</div>
            <div>Date de naissance: {patient.dateNaissance}</div>
            <div>Groupe sanguin: {patient.groupeSanguin}</div>
            <div>Genre: {patient.genre}</div>
            <div className="mt-4">
              <Button onClick={() => window.location.href = `/radiologue/examens/nouveau?patientID=${patient.patientID}`}>Nouvel examen</Button>
            </div>
          </div>

          {/* Exams List Card */}
          <div className="bg-white rounded shadow p-4 border space-y-2">
            <h3 className="text-xl font-semibold mb-2">Examens médicaux de ce patient</h3>
            {exams.length === 0 ? (
              <div className="text-gray-500">Aucun examen trouvé pour ce patient.</div>
            ) : (
              <div className="space-y-3">
                {exams.map(exam => (
                  <div
                    key={exam.examenID}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-lg">
                            {format(new Date(exam.dateExamen), "dd/MM/yyyy à HH:mm", { locale: fr })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {exam.typeExamen.nomType} ({exam.typeExamen.categorie})
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Demandé par : {exam.demandePar.prenom} {exam.demandePar.nom}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant={exam.estAnalyse ? "default" : "outline"} className={exam.estAnalyse ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {exam.estAnalyse ? "Analysé" : "En attente"}
                        </Badge>
                        <span className="text-xs text-gray-500">{exam.images.length} image{exam.images.length !== 1 ? "s" : ""}</span>
                        <a href={`/radiologue/examens/${exam.examenID}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                    {exam.description && (
                      <div className="text-xs text-gray-600 mt-1">{exam.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-gray-500">Patient introuvable.</div>
      )}
    </div>
  );
} 