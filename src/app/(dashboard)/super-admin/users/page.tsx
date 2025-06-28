"use client";

import { useEffect, useState, useRef } from "react";
import { usersService, User } from "@/lib/services/users.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { UserFormDialog } from "./UserFormDialog";
import { UserEditDialog } from "./UserEditDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

const roles = [
  { label: "Tous", value: "all" },
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "Admin", value: "ADMINISTRATEUR" },
  { label: "Médecin", value: "MEDECIN" },
  { label: "Réceptionniste", value: "RECEPTIONNISTE" },
  { label: "Radiologue", value: "RADIOLOGUE" },
  { label: "Technicien", value: "TECHNICIEN" },
];

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  // Pagination (simple, à améliorer si besoin)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await usersService.getAll();
      // Filter out the current super admin user
      const filtered = data.filter(u => u.utilisateurID !== user?.utilisateurID);
      setUsers(filtered);
    } finally {
      setLoading(false);
    }
  }

  // Recherche et filtres
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(search.toLowerCase()) ||
      user.prenom.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter && roleFilter !== "all" ? user.role === roleFilter : true;
    const matchesStatus = statusFilter && statusFilter !== "all"
      ? (statusFilter === "actif" ? user.estActif : !user.estActif)
      : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  async function handleToggleActive(user: User) {
    setToggleLoading(user.utilisateurID);
    try {
      await usersService.update(user.utilisateurID, { estActif: !user.estActif });
      await fetchUsers();
    } finally {
      setToggleLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
        <UserFormDialog onUserCreated={fetchUsers} />
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Établissement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.utilisateurID}>
                  <TableCell>{user.nom}</TableCell>
                  <TableCell>{user.prenom}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.telephone}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.etablissement?.nom || "-"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.estActif}
                      disabled={toggleLoading === user.utilisateurID}
                      onCheckedChange={() => handleToggleActive(user)}
                      aria-label={user.estActif ? "Désactiver" : "Activer"}
                    />
                    {toggleLoading === user.utilisateurID && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <UserEditDialog user={user} onUserUpdated={fetchUsers} />
                      <ConfirmDeleteDialog
                        onConfirm={async () => {
                          await usersService.remove(user.utilisateurID);
                          await fetchUsers();
                        }}
                        title={`Supprimer l'utilisateur ?`}
                        description={`Cette action supprimera définitivement l'utilisateur "${user.nom} ${user.prenom}".`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Précédent
        </Button>
        <span className="text-sm">
          Page {page} / {totalPages || 1}
        </span>
        <Button variant="outline" size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>
          Suivant
        </Button>
      </div>
    </div>
  );
} 