"use client";
import { useEffect, useState } from "react";
import { consultationMedicaleService, ConsultationMedicale } from "@/lib/services/consultation-medicale.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Search, Calendar, User, FileText, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MedecinConsultationsPage() {
    const { user } = useAuth();
    const router = useRouter();
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
            <div className="flex items-center justify-center h-full">
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

            <div className="grid gap-4">
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
                        <Card 
                            key={consultation.consultationID} 
                            className="hover:shadow-md transition-all duration-200 cursor-pointer group"
                            onClick={() => router.push(`/medecin/consultation/${consultation.consultationID}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="bg-emerald-100 p-2 rounded-full">
                                            <User className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {consultation.dossier?.patient?.prenom} {consultation.dossier?.patient?.nom}
                                                </h3>
                                                <div className="flex gap-2">
                                                    {consultation.estTelemedicine && (
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                                            Télémédecine
                                                        </Badge>
                                                    )}
                                                    {consultation.ordonnances && consultation.ordonnances.length > 0 && (
                                                        <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                                                            Ordonnance
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {format(new Date(consultation.dateConsultation), 'PPP à HH:mm', { locale: fr })}
                                                    </span>
                                                </div>
                                                <span>•</span>
                                                <span className="text-gray-700 font-medium">
                                                    {consultation.motif.length > 60 
                                                        ? `${consultation.motif.substring(0, 60)}...` 
                                                        : consultation.motif
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/medecin/consultation/${consultation.consultationID}`);
                                            }}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}