"use client";

import { useEffect, useState } from "react";
import { usersService, User } from "@/lib/services/users.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AdminUserFormDialog } from "./AdminUserFormDialog";
import { AdminUserEditDialog } from "./AdminUserEditDialog";

const roleOptions = [
  { label: "Tous les rôles", value: "" },
  { label: "Administrateur", value: "ADMINISTRATEUR" },
  { label: "Médecin", value: "MEDECIN" },
  { label: "Radiologue", value: "RADIOLOGUE" },
  { label: "Réceptionniste", value: "RECEPTIONNISTE" },
];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [user?.etablissementID]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await usersService.getAll();
      // Filtrer côté frontend si le backend ne filtre pas déjà
      const filtered = data
        .filter(u => u.etablissement?.etablissementID === user?.etablissementID)
        .filter(u => u.utilisateurID !== user?.utilisateurID);
      setUsers(filtered);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(userRow: User) {
    setToggleLoading(userRow.utilisateurID);
    try {
      await usersService.update(userRow.utilisateurID, { estActif: !userRow.estActif });
      await fetchUsers();
    } finally {
      setToggleLoading(null);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
        <AdminUserFormDialog onUserCreated={fetchUsers} />
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
            {roleOptions.map((role) => (
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
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((userRow) => (
                <TableRow key={userRow.utilisateurID}>
                  <TableCell>
                    <div className="max-w-[120px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={userRow.nom}>{userRow.nom}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[120px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={userRow.prenom}>{userRow.prenom}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={userRow.email}>{userRow.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[100px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={userRow.username}>{userRow.username}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[100px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={userRow.telephone}>{userRow.telephone}</div>
                  </TableCell>
                  <TableCell>{userRow.role}</TableCell>
                  <TableCell>
                    <Switch
                      checked={userRow.estActif}
                      disabled={toggleLoading === userRow.utilisateurID}
                      onCheckedChange={() => handleToggleActive(userRow)}
                      aria-label={userRow.estActif ? "Désactiver" : "Activer"}
                    />
                    {toggleLoading === userRow.utilisateurID && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <AdminUserEditDialog userToEdit={userRow} onUserUpdated={fetchUsers} />
                      <Button size="icon" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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