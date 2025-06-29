"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersService, CreateUserDto } from "@/lib/services/users.service";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from 'sonner';

const roleOptions = [
  { label: "Administrateur", value: "ADMINISTRATEUR" },
  { label: "Médecin", value: "MEDECIN" },
  { label: "Radiologue", value: "RADIOLOGUE" },
  { label: "Réceptionniste", value: "RECEPTIONNISTE" },
];

export function AdminUserFormDialog({ onUserCreated }: { onUserCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateUserDto>({
    nom: "",
    prenom: "",
    email: "",
    username: "",
    telephone: "",
    role: "MEDECIN",
    password: "",
    etablissementID: user?.etablissementID,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setForm({ ...form, role: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersService.create({ ...form, etablissementID: user?.etablissementID });
      setOpen(false);
      setForm({
        nom: "",
        prenom: "",
        email: "",
        username: "",
        telephone: "",
        role: "MEDECIN",
        password: "",
        etablissementID: user?.etablissementID,
      });
      toast.success('Utilisateur créé avec succès');
      onUserCreated();
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
          <Plus className="w-4 h-4" /> Ajouter un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
            <Input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
          </div>
          <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
          <Input name="username" placeholder="Nom d'utilisateur" value={form.username} onChange={handleChange} required />
          <Input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} required />
          <Select value={form.role} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input name="password" placeholder="Mot de passe" type="password" value={form.password} onChange={handleChange} required minLength={6} />
          <div className="text-xs text-gray-500">Établissement : <span className="font-semibold">{user?.etablissementID || "-"}</span></div>
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