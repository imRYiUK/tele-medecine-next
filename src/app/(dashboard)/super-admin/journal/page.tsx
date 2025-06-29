"use client";
import { useEffect, useState } from "react";
import { journalService, JournalEntry } from "@/lib/services/journal.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User as UserIcon, Mail, Shield, Activity, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchEntries();
  }, []);

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
    const user = entry.utilisateur;
    const searchStr =
      `${user?.prenom || ""} ${user?.nom || ""} ${user?.email || ""} ${user?.role || ""} ${entry.typeAction || ""} ${entry.description || ""}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  // Pagination
  const paginatedEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredEntries.length / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Journal d'activité</h2>
        <Button variant="outline" onClick={fetchEntries} disabled={loading}>
          Rafraîchir
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Rechercher par utilisateur, action, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : paginatedEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Aucune activité trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEntries.map((entry) => (
                  <TableRow key={entry.journalActiviteID} className="hover:bg-gray-50 transition">
                    <TableCell>
                      <div className="font-semibold text-gray-900">
                        <div className="max-w-[150px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={`${entry.utilisateur?.prenom} ${entry.utilisateur?.nom}`}>
                          {entry.utilisateur?.prenom} {entry.utilisateur?.nom}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div className="max-w-[150px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={entry.utilisateur?.email}>{entry.utilisateur?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[100px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={entry.utilisateur?.role}>{entry.utilisateur?.role}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[120px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={entry.typeAction}>{entry.typeAction}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate text-ellipsis overflow-hidden whitespace-nowrap" title={entry.description}>{entry.description}</div>
                    </TableCell>
                    <TableCell>{format(new Date(entry.dateAction), 'Pp', { locale: fr })}</TableCell>
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
                        <UserIcon className="h-5 w-5 text-blue-600" />
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
                    <Badge variant="outline" className="ml-3 flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                      {entry.utilisateur?.role}
                    </Badge>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Action</span>
                        <p className="truncate text-gray-900" title={entry.typeAction}>{entry.typeAction}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Description</span>
                        <p className="truncate text-gray-900" title={entry.description}>{entry.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Date</span>
                        <p className="text-gray-900">{format(new Date(entry.dateAction), 'Pp', { locale: fr })}</p>
                      </div>
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