"use client";
import { useEffect, useState } from "react";
import { rendezVousService, RendezVous as RendezVousApi } from "@/lib/services/rendez-vous.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams, useRouter } from "next/navigation";
import { usersService, User } from "@/lib/services/users.service";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { patientsService, Patient } from "@/lib/services/patients.service";

interface RendezVous extends RendezVousApi {
  date?: string;
  heure?: string;
}

function RendezVousForm({ patientID, onCreated }: { patientID?: string, onCreated: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    patientID: patientID || "",
    medecinID: "",
    dateHeure: "",
    motif: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medecins, setMedecins] = useState<User[]>([]);
  const [searchMedecin, setSearchMedecin] = useState("");
  const [openCombo, setOpenCombo] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchPatient, setSearchPatient] = useState("");
  const [openPatientCombo, setOpenPatientCombo] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, patientID: patientID || "" }));
  }, [patientID]);

  useEffect(() => {
    // Utilise user.etablissementID directement (champ existant dans User)
    const etabId = user?.etablissementID;
    if (etabId) {
      usersService.getMedecinsByEtablissement(etabId).then(setMedecins);
    } else {
      setMedecins([]);
    }
  }, [user?.etablissementID]);

  useEffect(() => {
    patientsService.getAll().then(setPatients);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await rendezVousService.create({
        patientID: form.patientID,
        medecinID: form.medecinID,
        dateHeure: form.dateHeure,
        motif: form.motif,
      });
      toast.success("Rendez-vous créé avec succès");
      onCreated();
      router.push("/receptionniste/rendez-vous");
    } catch (err: any) {
      setError("Erreur lors de la création du rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage dynamique des médecins selon la recherche
  const filteredMedecins = medecins.filter((m) => {
    const searchStr = `${m.prenom} ${m.nom} ${m.email || ''} ${m.telephone || ''}`.toLowerCase();
    return searchStr.includes(searchMedecin.toLowerCase());
  }).slice(0, 8);

  // Filtrage dynamique des patients selon la recherche
  const filteredPatients = patients.filter((p) => {
    const searchStr = `${p.prenom} ${p.nom} ${p.email || ''} ${p.telephone || ''}`.toLowerCase();
    return searchStr.includes(searchPatient.toLowerCase());
  }).slice(0, 8);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-6 border space-y-4">
      {/*<h3 className="text-lg font-semibold mb-2">Créer un rendez-vous</h3>*/}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          <div className="relative">
            <button
              type="button"
              className="border rounded px-2 py-2 w-full text-left bg-white"
              onClick={() => setOpenPatientCombo(true)}
            >
              {form.patientID
                ? (() => {
                    const p = patients.find((p) => p.patientID === form.patientID);
                    return p
                      ? `${p.prenom} ${p.nom} • ${p.dateNaissance || ''} • ${p.email || p.telephone || ''}`
                      : "Sélectionner un patient...";
                  })()
                : "Sélectionner un patient..."}
            </button>
            {openPatientCombo && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Rechercher un patient..."
                    value={searchPatient}
                    onChange={e => setSearchPatient(e.target.value)}
                    className="border rounded px-2 py-1 w-full mb-2"
                    autoFocus
                  />
                  {filteredPatients.length === 0 && (
                    <div className="text-gray-400 text-sm p-2">Aucun patient trouvé.</div>
                  )}
                  {filteredPatients.map((p) => (
                    <div
                      key={p.patientID}
                      className={`p-2 cursor-pointer hover:bg-emerald-50 rounded flex flex-col ${form.patientID === p.patientID ? 'bg-emerald-100' : ''}`}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, patientID: p.patientID }));
                        setOpenPatientCombo(false);
                      }}
                    >
                      <span className="font-medium">{p.prenom} {p.nom}</span>
                      <span className="text-xs text-gray-500">{p.dateNaissance ? `Né(e) le ${p.dateNaissance}` : ''}</span>
                      <span className="text-xs text-gray-500">{p.email || p.telephone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input type="hidden" name="patientID" value={form.patientID} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Médecin</label>
          <div className="relative">
            <button
              type="button"
              className="border rounded px-2 py-2 w-full text-left bg-white"
              onClick={() => setOpenCombo(true)}
            >
              {form.medecinID
                ? (() => {
                    const m = medecins.find((m) => m.utilisateurID === form.medecinID);
                    return m
                      ? `${m.prenom} ${m.nom} • ${m.email || m.telephone || ''}`
                      : "Sélectionner un médecin...";
                  })()
                : "Sélectionner un médecin..."}
            </button>
            {openCombo && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Rechercher un médecin..."
                    value={searchMedecin}
                    onChange={e => setSearchMedecin(e.target.value)}
                    className="border rounded px-2 py-1 w-full mb-2"
                    autoFocus
                  />
                  {filteredMedecins.length === 0 && (
                    <div className="text-gray-400 text-sm p-2">Aucun médecin trouvé.</div>
                  )}
                  {filteredMedecins.map((m) => (
                    <div
                      key={m.utilisateurID}
                      className={`p-2 cursor-pointer hover:bg-emerald-50 rounded flex flex-col ${form.medecinID === m.utilisateurID ? 'bg-emerald-100' : ''}`}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, medecinID: m.utilisateurID }));
                        setOpenCombo(false);
                      }}
                    >
                      <span className="font-medium">{m.prenom} {m.nom}</span>
                      <span className="text-xs text-gray-500">{m.email || m.telephone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input type="hidden" name="medecinID" value={form.medecinID} required />
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
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchRdvs();
  }, []);

  function handleCreated() {
    fetchRdvs();
    setDialogOpen(false);
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
      {!patientID && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mb-2">Créer un rendez-vous</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un rendez-vous</DialogTitle>
            </DialogHeader>
            <RendezVousForm onCreated={handleCreated} />
          </DialogContent>
        </Dialog>
      )}
      {patientID && <RendezVousForm patientID={patientID} onCreated={handleCreated} />}
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
              <TableHead>Motif</TableHead>
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
                  <TableCell>
                    {rdv.date && rdv.heure
                      ? format(new Date(`${rdv.date}T${rdv.heure}`), 'Pp', { locale: fr })
                      : rdv.date
                        ? format(new Date(rdv.date), 'P', { locale: fr })
                        : '—'
                    }
                  </TableCell>
                  <TableCell>{rdv.motif}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 