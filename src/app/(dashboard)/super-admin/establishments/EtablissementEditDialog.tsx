"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { etablissementsService, UpdateEtablissementDto, Etablissement } from "@/lib/services/etablissements.service";
import { Loader2, Pencil } from "lucide-react";

const types = [
  { label: "Hôpital", value: "HOPITAL" },
  { label: "Clinique", value: "CLINIQUE" },
  { label: "Centre de santé", value: "CENTRE_SANTE" },
  { label: "Laboratoire", value: "LABORATOIRE" },
  { label: "Cabinet", value: "CABINET" },
];

export function EtablissementEditDialog({ etab, onUpdated }: { etab: Etablissement; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateEtablissementDto>({
    nom: etab.nom,
    type: etab.type,
    region: etab.region,
    adresse: etab.adresse,
    telephone: etab.telephone,
    email: etab.email,
    description: etab.description,
    siteWeb: etab.siteWeb,
    estActif: etab.estActif,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setForm({ ...form, type: value });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, estActif: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await etablissementsService.update(etab.etablissementID, form);
      setOpen(false);
      onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
        <Pencil className="w-4 h-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'établissement</DialogTitle>
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
          <Input name="siteWeb" placeholder="Site web (optionnel)" value={form.siteWeb || ""} onChange={handleChange} />
          <Input name="description" placeholder="Description (optionnel)" value={form.description || ""} onChange={handleChange} />
          <div className="flex items-center gap-2">
            <span>Actif</span>
            <input type="checkbox" checked={form.estActif} onChange={handleCheckbox} />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 