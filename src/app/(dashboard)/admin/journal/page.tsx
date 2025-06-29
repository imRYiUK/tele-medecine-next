"use client";
import { useEffect, useState } from "react";
import { journalService, JournalEntry } from "@/lib/services/journal.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/lib/hooks/useAuth";

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
                    <div className="font-semibold text-gray-900">{entry.utilisateur?.prenom} {entry.utilisateur?.nom}</div>
                    <div className="text-xs text-gray-500">{entry.utilisateur?.email}</div>
                  </TableCell>
                  <TableCell>{entry.utilisateur?.role}</TableCell>
                  <TableCell>{entry.typeAction}</TableCell>
                  <TableCell className="max-w-xs truncate" title={entry.description}>{entry.description}</TableCell>
                  <TableCell>{format(new Date(entry.dateAction), 'Pp', { locale: fr })}</TableCell>
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