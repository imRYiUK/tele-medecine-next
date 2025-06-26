"use client";
import { useEffect, useState } from "react";
import { patientsService, Patient } from "@/lib/services/patients.service";
import { rendezVousService } from "@/lib/services/rendez-vous.service";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function MedecinPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.utilisateurID) {
      fetchPatients(user.utilisateurID);
    }
  }, [user?.utilisateurID]);

  async function fetchPatients(medecinID: string) {
    setLoading(true);
    try {
      // Get all rendez-vous for this medecin, then extract unique patient IDs
      const rdvs = await rendezVousService.getByMedecin(medecinID);
      const patientIDs = Array.from(new Set(rdvs.map(rdv => rdv.patient?.patientID))).filter((id): id is string => Boolean(id));
      // Fetch patient details for each unique patientID
      const patientPromises = patientIDs.map(id => patientsService.getById(id));
      const patientsData = await Promise.all(patientPromises);
      setPatients(patientsData);
    } finally {
      setLoading(false);
    }
  }

  // Filtrage des patients selon la recherche
  const filteredPatients = patients.filter((p) => {
    const searchStr = `${p.prenom} ${p.nom} ${p.email || ''} ${p.telephone || ''}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-emerald-700">Mes Patients</h2>
      <div className="mb-4 max-w-xs">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, email ou téléphone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
        </div>
      ) : (
        <div className="bg-white rounded shadow p-4 border">
          {filteredPatients.length === 0 ? (
            <div className="text-gray-500">Aucun patient trouvé.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-left">Contact</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.patientID} className="hover:bg-emerald-50">
                    <td className="px-4 py-2">{patient.prenom} {patient.nom}</td>
                    <td className="px-4 py-2">{patient.email || patient.telephone}</td>
                    <td className="px-4 py-2">
                      <Link href={`/medecin/patients/${patient.patientID}`} className="text-emerald-700 hover:underline">Voir</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
} 