"use client";
import { useEffect, useState, useRef } from "react";
import { patientsService, Patient } from "@/lib/services/patients.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

// Move the dialog component outside to prevent re-creation on every render
function NouveauPatientDialog({ 
  open, 
  onOpenChange, 
  form, 
  onFormChange, 
  onSubmit, 
  loadingForm, 
  error, 
  onPatientCreated 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loadingForm: boolean;
  error: string | null;
  onPatientCreated: () => void;
}) {
  const initialRef = useRef<HTMLInputElement>(null);
  const GROUPE_SANGUIN_LIST = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">Nouveau patient</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau patient</DialogTitle>
          <DialogDescription>
            Remplissez les informations du patient pour créer un nouveau dossier médical.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="nom" className="text-sm font-medium text-gray-700">Nom</label>
              <Input id="nom" name="nom" placeholder="Nom" value={form.nom} onChange={onFormChange} required ref={initialRef} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="prenom" className="text-sm font-medium text-gray-700">Prénom</label>
              <Input id="prenom" name="prenom" placeholder="Prénom" value={form.prenom} onChange={onFormChange} required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="dateNaissance" className="text-sm font-medium text-gray-700">Date de naissance</label>
              <Input id="dateNaissance" name="dateNaissance" type="date" value={form.dateNaissance} onChange={onFormChange} required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="genre" className="text-sm font-medium text-gray-700">Genre</label>
              <select id="genre" name="genre" value={form.genre} onChange={onFormChange} className="border rounded px-2 py-2 focus:ring-2 focus:ring-emerald-500">
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label htmlFor="adresse" className="text-sm font-medium text-gray-700">Adresse</label>
              <Input id="adresse" name="adresse" placeholder="Adresse complète" value={form.adresse} onChange={onFormChange} required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="telephone" className="text-sm font-medium text-gray-700">Téléphone</label>
              <Input id="telephone" name="telephone" placeholder="Numéro de téléphone" value={form.telephone} onChange={onFormChange} required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <Input id="email" name="email" type="email" placeholder="Adresse email" value={form.email} onChange={onFormChange} required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="groupeSanguin" className="text-sm font-medium text-gray-700">Groupe sanguin</label>
              <select id="groupeSanguin" name="groupeSanguin" value={form.groupeSanguin} onChange={onFormChange} className="border rounded px-2 py-2 focus:ring-2 focus:ring-emerald-500">
                {GROUPE_SANGUIN_LIST.map((groupe) => (
                  <option key={groupe} value={groupe}>{groupe}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="etatDossier" className="text-sm font-medium text-gray-700">État du dossier médical</label>
              <select id="etatDossier" name="dossierMedical.etatDossier" value={form.dossierMedical.etatDossier} onChange={onFormChange} className="border rounded px-2 py-2 focus:ring-2 focus:ring-emerald-500">
                <option value="ACTIF">Dossier Actif</option>
                <option value="INACTIF">Dossier Inactif</option>
                <option value="ARCHIVE">Dossier Archivé</option>
              </select>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <DialogFooter className="flex flex-row gap-2 justify-end pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loadingForm} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loadingForm ? <Loader2 className="animate-spin w-4 h-4" /> : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ReceptionnistePatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    setLoading(true);
    try {
      const data = await patientsService.getAll();
      setPatients(data);
    } finally {
      setLoading(false);
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const searchStr = `${patient.prenom || ""} ${patient.nom || ""} ${patient.email || ""}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const initialForm = {
    nom: "",
    prenom: "",
    dateNaissance: "",
    genre: "M" as const,
    adresse: "",
    telephone: "",
    email: "",
    groupeSanguin: "A+",
    dossierMedical: { etatDossier: "ACTIF" as const },
  };
  const [form, setForm] = useState(initialForm);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("dossierMedical.")) {
      setForm((prev) => ({
        ...prev,
        dossierMedical: {
          ...prev.dossierMedical,
          [name.split(".")[1]]: name.split(".")[1] === "etatDossier" 
            ? (value as 'ACTIF' | 'INACTIF' | 'ARCHIVE')
            : value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setForm(initialForm);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setError(null);
    try {
      await patientsService.create({
        ...form,
        createdBy: user?.utilisateurID || "",
        dossierMedical: form.dossierMedical,
      });
      setOpen(false);
      setForm(initialForm);
      fetchPatients();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de la création du patient");
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Patients</h2>
        <div className="flex gap-2">
          <NouveauPatientDialog 
            open={open}
            onOpenChange={handleDialogOpenChange}
            form={form}
            onFormChange={handleChange}
            onSubmit={handleSubmit}
            loadingForm={loadingForm}
            error={error}
            onPatientCreated={fetchPatients}
          />
          <Button variant="outline" onClick={fetchPatients} disabled={loading}>
            Rafraîchir
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Rechercher par nom, prénom, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom & Prénom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <Loader2 className="mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  Aucun patient trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.patientID} className="hover:bg-emerald-50 transition">
                  <TableCell>
                    <Link href={`/receptionniste/patients/${patient.patientID}`} className="block w-full h-full text-emerald-700 hover:underline">
                      {patient.nom} {patient.prenom}
                    </Link>
                  </TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.telephone}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 