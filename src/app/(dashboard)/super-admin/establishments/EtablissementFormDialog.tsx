"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { etablissementsService, CreateEtablissementDto } from "@/lib/services/etablissements.service";
import { Loader2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

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
  const [enableOrthanc, setEnableOrthanc] = useState(false);
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

  const handleOrthancToggle = (checked: boolean) => {
    setEnableOrthanc(checked);
    if (!checked) {
      // Clear Orthanc fields when disabled
      setForm(prev => ({
        ...prev,
        orthancUrl: undefined,
        orthancLogin: undefined,
        orthancPassword: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = { ...form };
      if (!enableOrthanc) {
        // Remove Orthanc fields if not enabled
        delete submitData.orthancUrl;
        delete submitData.orthancLogin;
        delete submitData.orthancPassword;
      }
      await etablissementsService.create(submitData);
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
      setEnableOrthanc(false);
      toast.success('Établissement créé avec succès');
      onCreated();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Erreur lors de la création";
      toast.error(errorMessage);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un établissement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="region" placeholder="Région" value={form.region} onChange={handleChange} required />
            <Input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} required />
          </div>
          
          <Input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} required />
          <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="siteWeb" placeholder="Site web (optionnel)" value={form.siteWeb} onChange={handleChange} />
            <Input name="description" placeholder="Description (optionnel)" value={form.description} onChange={handleChange} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="estActif"
              checked={form.estActif}
              onCheckedChange={(checked) => setForm(f => ({ ...f, estActif: checked }))}
            />
            <Label htmlFor="estActif">Actif</Label>
          </div>

          {/* Orthanc Configuration Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="enableOrthanc"
                checked={enableOrthanc}
                onCheckedChange={handleOrthancToggle}
              />
              <Label htmlFor="enableOrthanc" className="font-medium">Configuration Orthanc</Label>
            </div>
            
            {enableOrthanc && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                <Input 
                  name="orthancUrl" 
                  placeholder="URL Orthanc (ex: http://localhost:8042)" 
                  value={form.orthancUrl || ""} 
                  onChange={handleChange} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    name="orthancLogin" 
                    placeholder="Login Orthanc" 
                    value={form.orthancLogin || ""} 
                    onChange={handleChange} 
                  />
                  <Input 
                    name="orthancPassword" 
                    type="password"
                    placeholder="Mot de passe Orthanc" 
                    value={form.orthancPassword || ""} 
                    onChange={handleChange} 
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Laissez les champs vides pour utiliser la configuration par défaut sans authentification.
                </p>
              </div>
            )}
          </div>

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