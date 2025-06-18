"use client";
import { useEffect, useState } from "react";
import { rendezVousService, RendezVous } from "@/lib/services/rendez-vous.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { usersService, User } from "@/lib/services/users.service";
import { useAuth } from "@/lib/hooks/useAuth";

function RendezVousForm({ patientID, onCreated }: { patientID?: string, onCreated: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    patientID: patientID || "",
    medecinID: "",
    dateHeure: "",
    motif: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medecins, setMedecins] = useState<User[]>([]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, patientID: patientID || "" }));
  }, [patientID]);

  useEffect(() => {
    // Supporte user.etablissement?.etablissementID ou user.etablissementID
    const etabId = user && (user.etablissement?.etablissementID || (user as any).etablissementID)
      ? user.etablissement?.etablissementID || (user as any).etablissementID
      : undefined;
    if (etabId) {
      usersService.getMedecinsByEtablissement(etabId).then(setMedecins);
    } else {
      setMedecins([]);
    }
  }, [user && (user.etablissement?.etablissementID || (user as any).etablissementID)]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: Appeler rendezVousService.create(form)
      // await rendezVousService.create(form);
      onCreated();
    } catch (err: any) {
      setError("Erreur lors de la création du rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-6 border space-y-4">
      <h3 className="text-lg font-semibold mb-2">Créer un rendez-vous</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          <Input name="patientID" value={form.patientID} disabled className="bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Médecin</label>
          <select name="medecinID" value={form.medecinID} onChange={handleChange} required className="border rounded px-2 py-2 w-full">
            <option value="">Sélectionner...</option>
            {medecins.map((m) => (
              <option key={m.utilisateurID} value={m.utilisateurID}>{m.prenom} {m.nom}</option>
            ))}
          </select>
          {medecins.length === 0 && (
            <div className="text-xs text-red-500 mt-1">Aucun médecin trouvé pour cet établissement.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date et heure</label>
          <Input name="dateHeure" type="datetime-local" value={form.dateHeure} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Motif</label>
        <textarea name="motif" value={form.motif} onChange={handleChange} required className="border rounded px-2 py-2 w-full min-h-[38px]" placeholder="Motif du rendez-vous" />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Créer le rendez-vous"}
        </Button>
      </div>
    </form>
  );
}

export default function ReceptionnisteRendezVousPage() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const patientID = searchParams.get("patientID") || undefined;
  const [showForm, setShowForm] = useState(!!patientID);

  useEffect(() => {
    fetchRdvs();
  }, []);

  function handleCreated() {
    setShowForm(false);
    fetchRdvs();
  }

  async function fetchRdvs() {
    setLoading(true);
    try {
      const data = await rendezVousService.getAll();
      setRdvs(data);
    } finally {
      setLoading(false);
    }
  }

  const filteredRdvs = rdvs.filter((rdv) => {
    const searchStr = `${rdv.patient?.prenom || ""} ${rdv.patient?.nom || ""} ${rdv.medecin?.prenom || ""} ${rdv.medecin?.nom || ""}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {showForm && <RendezVousForm patientID={patientID} onCreated={handleCreated} />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Rendez-vous</h2>
        <Button variant="outline" onClick={fetchRdvs} disabled={loading}>
          Rafraîchir
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Rechercher par patient ou médecin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Médecin</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : filteredRdvs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Aucun rendez-vous trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredRdvs.map((rdv) => (
                <TableRow key={rdv.rendezVousID} className="hover:bg-gray-50 transition">
                  <TableCell>{rdv.patient?.prenom} {rdv.patient?.nom}</TableCell>
                  <TableCell>{rdv.medecin?.prenom} {rdv.medecin?.nom}</TableCell>
                  <TableCell>{format(new Date(rdv.dateHeure), 'Pp', { locale: fr })}</TableCell>
                  <TableCell>{rdv.statut}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 