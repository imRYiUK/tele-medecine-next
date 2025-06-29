"use client";

import { useEffect, useState, useRef } from "react";
import { etablissementsService, Etablissement } from "@/lib/services/etablissements.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, MapPin, Phone, Mail, Users, Calendar, Building2, CheckCircle, XCircle } from "lucide-react";
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
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
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
                    <TableCell className="font-semibold text-gray-900">
                      <div className="max-w-[200px] truncate" title={e.nom}>{e.nom}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{e.type}</Badge></TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={e.region}>{e.region}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={e.adresse}>{e.adresse}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[120px] truncate" title={e.telephone}>{e.telephone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[120px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={e.email}>{e.email}</div>
                    </TableCell>
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

        {/* Mobile Card View */}
        <div className="md:hidden">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto animate-spin h-8 w-8 text-gray-400" />
              <p className="mt-2 text-gray-500">Chargement des établissements...</p>
            </div>
          ) : paginatedEtabs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">Aucun établissement trouvé.</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {paginatedEtabs.map((e) => (
                <div key={e.etablissementID} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900 truncate text-lg" title={e.nom}>
                          {e.nom}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 truncate" title={e.region}>
                          {e.region}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-3 flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                      {e.type}
                    </Badge>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Adresse</span>
                        <p className="truncate text-gray-900" title={e.adresse}>{e.adresse}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Téléphone</span>
                        <p className="truncate text-gray-900" title={e.telephone}>{e.telephone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Email</span>
                        <p className="truncate text-gray-900" title={e.email}>{e.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 flex-shrink-0">
                        {e.orthancUrl ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Orthanc</span>
                        {e.orthancUrl ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 mt-1">
                            Configuré
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="mt-1">Non configuré</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Utilisateurs</span>
                        <Badge variant="secondary" className="mt-1">{e.utilisateursCount ?? 0}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Créé le</span>
                        <p className="text-gray-900 mt-1">{format(new Date(e.createdAt), 'P', { locale: fr })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={e.estActif}
                        disabled={toggleLoading === e.etablissementID}
                        onCheckedChange={() => handleToggleActive(e)}
                        aria-label={e.estActif ? "Désactiver" : "Activer"}
                      />
                      {toggleLoading === e.etablissementID && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                      <Badge variant={e.estActif ? "default" : "destructive"} className={e.estActif ? "bg-green-100 text-green-800 border-green-200" : ""}>
                        {e.estActif ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
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