"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersService, UpdateUserDto, User } from "@/lib/services/users.service";
import { Loader2, Pencil } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from 'sonner';

const roles = [
  { label: "Admin", value: "ADMINISTRATEUR" },
  { label: "Médecin", value: "MEDECIN" },
  { label: "Réceptionniste", value: "RECEPTIONNISTE" },
  { label: "Radiologue", value: "RADIOLOGUE" },
  { label: "Technicien", value: "TECHNICIEN" },
];

export function AdminUserEditDialog({ userToEdit, onUserUpdated }: { userToEdit: User; onUserUpdated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdateUserDto>({
    nom: userToEdit.nom,
    prenom: userToEdit.prenom,
    email: userToEdit.email,
    username: userToEdit.username,
    telephone: userToEdit.telephone,
    role: userToEdit.role,
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
      await usersService.update(userToEdit.utilisateurID, { ...form, etablissementID: user?.etablissementID });
      setOpen(false);
      toast.success('Utilisateur mis à jour avec succès');
      onUserUpdated();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Erreur lors de la modification";
      toast.error(errorMessage);
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
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
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
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-xs text-gray-500">Établissement : <span className="font-semibold">{user?.etablissementID || "-"}</span></div>
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