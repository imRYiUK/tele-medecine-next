"use client";

import { useEffect, useState, useRef } from "react";
import { etablissementsService, Etablissement } from "@/lib/services/etablissements.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EtablissementFormDialog } from "./EtablissementFormDialog";
import { EtablissementEditDialog } from "./EtablissementEditDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

const types = [
  { label: "Tous", value: "all" },
  { label: "Hôpital", value: "HOPITAL" },
  { label: "Clinique", value: "CLINIQUE" },
  { label: "Centre de santé", value: "CENTRE_SANTE" },
  { label: "Laboratoire", value: "LABORATOIRE" },
  { label: "Cabinet", value: "CABINET" },
];

export default function EstablishmentsPage() {
  const [etabs, setEtabs] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    fetchEtabs();
  }, []);

  async function fetchEtabs() {
    setLoading(true);
    try {
      const data = await etablissementsService.getAll();
      setEtabs(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(e: Etablissement) {
    setToggleLoading(e.etablissementID);
    try {
      await etablissementsService.update(e.etablissementID, { estActif: !e.estActif });
      await fetchEtabs();
    } finally {
      setToggleLoading(null);
    }
  }

  // Recherche et filtres
  const filteredEtabs = etabs.filter((e) => {
    const matchesSearch =
      e.nom.toLowerCase().includes(search.toLowerCase()) ||
      e.region.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.telephone.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter !== "all" ? e.type === typeFilter : true;
    const matchesStatus = statusFilter !== "all" ? (statusFilter === "actif" ? e.estActif : !e.estActif) : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const paginatedEtabs = filteredEtabs.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredEtabs.length / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Gestion des établissements</h2>
        <EtablissementFormDialog onCreated={fetchEtabs} />
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
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
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Région</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orthanc</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Utilisateurs</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  <Loader2 className="mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : paginatedEtabs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                  Aucun établissement trouvé.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEtabs.map((e) => (
                <TableRow key={e.etablissementID} className="hover:bg-gray-50 transition">
                  <TableCell className="font-semibold text-gray-900">{e.nom}</TableCell>
                  <TableCell><Badge variant="outline">{e.type}</Badge></TableCell>
                  <TableCell>{e.region}</TableCell>
                  <TableCell className="max-w-xs truncate" title={e.adresse}>{e.adresse}</TableCell>
                  <TableCell>{e.telephone}</TableCell>
                  <TableCell>{e.email}</TableCell>
                  <TableCell>
                    {e.orthancUrl ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Configuré
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Non configuré</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={e.estActif}
                        disabled={toggleLoading === e.etablissementID}
                        onCheckedChange={() => handleToggleActive(e)}
                        aria-label={e.estActif ? "Désactiver" : "Activer"}
                      />
                      {toggleLoading === e.etablissementID && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
                      <Badge variant={e.estActif ? "default" : "destructive"}>
                        {e.estActif ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.utilisateursCount ?? 0}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(e.createdAt), 'P', { locale: fr })}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <EtablissementEditDialog etab={e} onUpdated={fetchEtabs} />
                      <ConfirmDeleteDialog
                        onConfirm={async () => {
                          await etablissementsService.remove(e.etablissementID);
                          await fetchEtabs();
                        }}
                        title={`Supprimer l'établissement ?`}
                        description={`Cette action supprimera définitivement l'établissement "${e.nom}".`}
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