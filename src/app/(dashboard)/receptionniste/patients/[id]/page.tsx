"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { patientsService, Patient } from "@/lib/services/patients.service";
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle2, FileText, Stethoscope, FlaskConical, ArrowLeft, Droplets, BadgeInfo } from "lucide-react";
import Link from "next/link";

export default function PatientProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    patientsService.getById(id as string)
      .then(setPatient)
      .catch(() => setError("Patient introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-emerald-600" /></div>;
  }
  if (error || !patient) {
    return <div className="text-center text-red-500 py-8">{error || "Patient introuvable"}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Sticky retour */}
      <div className="sticky top-4 z-20 flex justify-start mb-2">
        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link href="/receptionniste/patients"><ArrowLeft className="w-4 h-4" /> Retour à la liste</Link>
        </Button>
      </div>
      {/* Header patient */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white rounded-xl shadow p-6 border">
        <div className="flex-shrink-0">
          <UserCircle2 className="w-24 h-24 text-emerald-400" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">{patient.nom} {patient.prenom}</h2>
            {patient.groupeSanguin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold"><Droplets className="w-4 h-4" /> {patient.groupeSanguin}</span>
            )}
            {patient.genre && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold"><BadgeInfo className="w-4 h-4" /> {patient.genre === "M" ? "Homme" : "Femme"}</span>
            )}
          </div>
          <div className="text-gray-600 flex flex-wrap gap-4">
            <span>Email : <span className="font-medium text-gray-800">{patient.email}</span></span>
            <span>Téléphone : <span className="font-medium text-gray-800">{patient.telephone}</span></span>
            {patient.dateNaissance && <span>Date de naissance : <span className="font-medium text-gray-800">{patient.dateNaissance}</span></span>}
            {patient.adresse && <span>Adresse : <span className="font-medium text-gray-800">{patient.adresse}</span></span>}
          </div>
        </div>
      </div>
      {/* Dossier médical */}
      <div className="bg-gray-50 rounded-xl shadow p-6 border">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <h3 className="text-xl font-semibold">Dossier médical</h3>
        </div>
        {patient.dossierMedical ? (
          <div className="flex flex-wrap gap-6 text-gray-700">
            <div>État : <span className="font-semibold text-emerald-700">{patient.dossierMedical.etatDossier}</span></div>
            <div>Date de création : {patient.dossierMedical.dateCreation}</div>
          </div>
        ) : (
          <div className="text-gray-400 italic">Aucun dossier médical trouvé.</div>
        )}
      </div>
      {/* Résumé consultations/examens + bouton rendez-vous */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white rounded-xl shadow p-6 border">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Stethoscope className="w-5 h-5" />
            {patient.consultations ? patient.consultations.length : 0} consultation(s) trouvée(s)
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <FlaskConical className="w-5 h-5" />
            {patient.examens ? patient.examens.length : 0} examen(s) médical(aux) trouvé(s)
          </div>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mt-4 md:mt-0">
          <Link href={`/receptionniste/rendez-vous?patientID=${patient.patientID}`}>
            Créer rendez-vous avec un médecin
          </Link>
        </Button>
      </div>
    </div>
  );
} 