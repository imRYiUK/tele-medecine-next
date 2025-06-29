"use client";
import { useEffect, useState } from "react";
import { journalService, JournalEntry } from "@/lib/services/journal.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User as UserIcon, Mail, Shield, Activity, Calendar, Clock, Search, RefreshCw, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/lib/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminJournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchEntries();
  }, [user?.etablissementID]);

  async function fetchEntries() {
    setLoading(true);
    try {
      const data = await journalService.getAll();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }

  // Recherche globale
  const filteredEntries = entries.filter((entry) => {
    const userLog = entry.utilisateur;
    const searchStr =
      `${userLog?.prenom || ""} ${userLog?.nom || ""} ${userLog?.email || ""} ${userLog?.role || ""} ${entry.typeAction || ""} ${entry.description || ""}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  // Pagination
  const paginatedEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredEntries.length / pageSize);

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MEDECIN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RADIOLOGUE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RECEPTIONNISTE':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Journal d'activité</h1>
          <p className="text-gray-600 mt-1">Suivi des activités de votre établissement</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchEntries} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par utilisateur, action, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>{filteredEntries.length} activité{filteredEntries.length > 1 ? 's' : ''} trouvée{filteredEntries.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Activités récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Utilisateur</TableHead>
                    <TableHead className="font-semibold text-gray-900">Rôle</TableHead>
                    <TableHead className="font-semibold text-gray-900">Action</TableHead>
                    <TableHead className="font-semibold text-gray-900">Description</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow key="loading">
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
                          <p className="text-gray-500">Chargement des activités...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedEntries.length === 0 ? (
                    <TableRow key="empty">
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Activity className="h-12 w-12 text-gray-300" />
                          <div>
                            <p className="text-gray-500 font-medium">Aucune activité trouvée</p>
                            <p className="text-gray-400 text-sm">
                              {search ? "Aucune activité ne correspond à votre recherche." : "Aucune activité enregistrée pour le moment."}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEntries.map((entry) => (
                      <TableRow key={entry.journalActiviteID} className="hover:bg-gray-50 transition-colors duration-200">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 truncate" title={`${entry.utilisateur?.prenom} ${entry.utilisateur?.nom}`}>
                                {entry.utilisateur?.prenom} {entry.utilisateur?.nom}
                              </div>
                              <div className="text-sm text-gray-500 truncate flex items-center gap-1" title={entry.utilisateur?.email}>
                                <Mail className="h-3 w-3" />
                                {entry.utilisateur?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleColor(entry.utilisateur?.role || '')}>
                            {entry.utilisateur?.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900 truncate max-w-[150px]" title={entry.typeAction}>
                            {entry.typeAction}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-700 truncate max-w-[250px]" title={entry.description}>
                            {entry.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(entry.dateAction), 'dd/MM/yyyy', { locale: fr })}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(entry.dateAction), 'HH:mm', { locale: fr })}
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
                  <Loader2 className="mx-auto animate-spin h-8 w-8 text-purple-600" />
                  <p className="mt-2 text-gray-500">Chargement des activités...</p>
                </div>
              ) : paginatedEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-gray-500">Aucune activité trouvée.</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {paginatedEntries.map((entry) => (
                    <div key={entry.journalActiviteID} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 truncate text-lg" title={`${entry.utilisateur?.prenom} ${entry.utilisateur?.nom}`}>
                              {entry.utilisateur?.prenom} {entry.utilisateur?.nom}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-600 truncate" title={entry.utilisateur?.email}>
                              {entry.utilisateur?.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`ml-3 flex-shrink-0 ${getRoleColor(entry.utilisateur?.role || '')}`}>
                          {entry.utilisateur?.role}
                        </Badge>
                      </div>
                      
                      {/* Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-500 text-xs uppercase tracking-wide">Action</span>
                            <p className="truncate text-gray-900 font-medium" title={entry.typeAction}>{entry.typeAction}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-500 text-xs uppercase tracking-wide">Description</span>
                            <p className="text-gray-900" title={entry.description}>{entry.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-500 text-xs uppercase tracking-wide">Date</span>
                            <p className="text-gray-900">{format(new Date(entry.dateAction), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Affichage de {((page - 1) * pageSize) + 1} à {Math.min(page * pageSize, filteredEntries.length)} sur {filteredEntries.length} activités
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
              Page {page} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === totalPages || totalPages === 0} 
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 