"use client";

import { useEffect, useState, useRef } from "react";
import { usersService, User } from "@/lib/services/users.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2, User as UserIcon, Mail, Phone, Building2, Shield, CheckCircle, XCircle } from "lucide-react";
import { UserFormDialog } from "./UserFormDialog";
import { UserEditDialog } from "./UserEditDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";

const roles = [
  { label: "Tous", value: "all" },
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "Admin", value: "ADMINISTRATEUR" },
  { label: "Médecin", value: "MEDECIN" },
  { label: "Réceptionniste", value: "RECEPTIONNISTE" },
  { label: "Radiologue", value: "RADIOLOGUE" },
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
        {/* Desktop Table View */}
        <div className="hidden md:block">
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
                    <TableCell>
                      <div className="max-w-[120px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={user.nom}>{user.nom}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[120px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={user.prenom}>{user.prenom}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={user.email}>{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[100px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={user.username}>{user.username}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[100px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={user.telephone}>{user.telephone}</div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={user.etablissement?.nom || "-"}>{user.etablissement?.nom || "-"}</div>
                    </TableCell>
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

        {/* Mobile Card View */}
        <div className="md:hidden">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto animate-spin h-8 w-8 text-gray-400" />
              <p className="mt-2 text-gray-500">Chargement des utilisateurs...</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {paginatedUsers.map((user) => (
                <div key={user.utilisateurID} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <UserIcon className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900 truncate text-lg" title={`${user.prenom} ${user.nom}`}>
                          {user.prenom} {user.nom}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 truncate" title={user.email}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-3 flex-shrink-0 bg-indigo-50 text-indigo-700 border-indigo-200">
                      {user.role}
                    </Badge>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Username</span>
                        <p className="truncate text-gray-900" title={user.username}>{user.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Téléphone</span>
                        <p className="truncate text-gray-900" title={user.telephone}>{user.telephone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Établissement</span>
                        <p className="truncate text-gray-900" title={user.etablissement?.nom || "-"}>{user.etablissement?.nom || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={user.estActif}
                        disabled={toggleLoading === user.utilisateurID}
                        onCheckedChange={() => handleToggleActive(user)}
                        aria-label={user.estActif ? "Désactiver" : "Activer"}
                      />
                      {toggleLoading === user.utilisateurID && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                      <div className="flex items-center gap-2">
                        {user.estActif ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={user.estActif ? "default" : "destructive"} className={user.estActif ? "bg-green-100 text-green-800 border-green-200" : ""}>
                          {user.estActif ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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