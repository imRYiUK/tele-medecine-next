"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { etablissementsService, CreateEtablissementDto } from "@/lib/services/etablissements.service";
import { Loader2, Plus } from "lucide-react";

const types = [
  { label: "Hôpital", value: "HOPITAL" },
  { label: "Clinique", value: "CLINIQUE" },
  { label: "Centre de santé", value: "CENTRE_SANTE" },
  { label: "Laboratoire", value: "LABORATOIRE" },
  { label: "Cabinet", value: "CABINET" },
];

export function EtablissementFormDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateEtablissementDto>({
    nom: "",
    type: "HOPITAL",
    region: "",
    adresse: "",
    telephone: "",
    email: "",
    description: "",
    siteWeb: "",
    estActif: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setForm({ ...form, type: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await etablissementsService.create(form);
      setOpen(false);
      setForm({
        nom: "",
        type: "HOPITAL",
        region: "",
        adresse: "",
        telephone: "",
        email: "",
        description: "",
        siteWeb: "",
        estActif: true,
      });
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter un établissement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un établissement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
          <Select value={form.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input name="region" placeholder="Région" value={form.region} onChange={handleChange} required />
          <Input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} required />
          <Input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} required />
          <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
          <Input name="siteWeb" placeholder="Site web (optionnel)" value={form.siteWeb} onChange={handleChange} />
          <Input name="description" placeholder="Description (optionnel)" value={form.description} onChange={handleChange} />
          <div className="flex items-center gap-2">
            <span>Actif</span>
            <input type="checkbox" checked={form.estActif} onChange={e => setForm(f => ({ ...f, estActif: e.target.checked }))} />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 