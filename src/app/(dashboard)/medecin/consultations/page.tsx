"use client";
import { useEffect, useState } from "react";
import { consultationMedicaleService, ConsultationMedicale } from "@/lib/services/consultation-medicale.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Search, Calendar, User, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MedecinConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationMedicale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.utilisateurID) {
      fetchConsultations();
    }
  }, [user?.utilisateurID]);

  async function fetchConsultations() {
    setLoading(true);
    try {
      const data = await consultationMedicaleService.getByMedecin(user!.utilisateurID);
      setConsultations(data);
    } catch (error) {
      console.error('Erreur lors du fetch des consultations:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredConsultations = consultations.filter((consultation) => {
    const searchStr = `${consultation.dossier?.patient?.prenom || ""} ${consultation.dossier?.patient?.nom || ""} ${consultation.motif || ""}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-emerald-700 tracking-tight">Consultations médicales</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par patient ou motif..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredConsultations.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune consultation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search ? "Aucune consultation ne correspond à votre recherche." : "Vous n'avez pas encore de consultations."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredConsultations.map((consultation) => (
            <Card key={consultation.consultationID} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-emerald-600" />
                    <div>
                      <CardTitle className="text-lg">
                        {consultation.dossier?.patient?.prenom} {consultation.dossier?.patient?.nom}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(consultation.dateConsultation), 'PPP à HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {consultation.estTelemedicine && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Télémédecine
                      </Badge>
                    )}
                    {consultation.ordonnances && consultation.ordonnances.length > 0 && (
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        Ordonnance
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Motif</h4>
                  <p className="text-gray-700">{consultation.motif}</p>
                </div>
                
                {consultation.diagnostics && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Diagnostics</h4>
                    <p className="text-gray-700">{consultation.diagnostics}</p>
                  </div>
                )}

                {consultation.observations && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Observations</h4>
                    <p className="text-gray-700">{consultation.observations}</p>
                  </div>
                )}

                {consultation.traitementPrescrit && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Traitement prescrit</h4>
                    <p className="text-gray-700">{consultation.traitementPrescrit}</p>
                  </div>
                )}

                {consultation.ordonnances && consultation.ordonnances.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ordonnance</h4>
                    <div className="space-y-2">
                      {consultation.ordonnances[0].prescriptions.map((prescription, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-900">
                            {prescription.medicament?.nom || `Médicament ${index + 1}`}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Posologie:</span> {prescription.posologie}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Durée:</span> {prescription.duree}
                          </div>
                          {prescription.instructions && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Instructions:</span> {prescription.instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 