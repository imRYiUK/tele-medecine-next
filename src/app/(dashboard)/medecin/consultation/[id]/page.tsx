"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { consultationMedicaleService, ConsultationMedicale } from "@/lib/services/consultation-medicale.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, ArrowLeft, User, Calendar, FileText, Pill, Stethoscope, Eye, Clipboard, Clock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConsultationDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [consultation, setConsultation] = useState<ConsultationMedicale | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchConsultation(id as string);
        }
    }, [id]);

    async function fetchConsultation(consultationID: string) {
        setLoading(true);
        try {
            const data = await consultationMedicaleService.getById(consultationID);
            setConsultation(data);
        } catch (error) {
            console.error('Erreur lors du fetch de la consultation:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        );
    }

    if (!consultation) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Consultation introuvable</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        La consultation demandée n'existe pas ou vous n'avez pas les permissions pour y accéder.
                    </p>
                    <Button 
                        onClick={() => router.push('/medecin/consultation')}
                        className="mt-4"
                    >
                        Retour aux consultations
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/medecin/consultation')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-emerald-700 tracking-tight">
                            Consultation #{consultation.consultationID?.slice(-8)}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {format(new Date(consultation.dateConsultation), 'EEEE d MMMM yyyy', { locale: fr })}
                        </p>
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

            {/* Patient Info Card */}
            <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 p-3 rounded-full">
                            <User className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {consultation.dossier?.patient?.prenom} {consultation.dossier?.patient?.nom}
                            </h2>
                            <p className="text-gray-600">
                                Patient • {consultation.dossier?.patient?.dateNaissance && 
                                    format(new Date(consultation.dossier.patient.dateNaissance), 'dd/MM/yyyy', { locale: fr })
                                }
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Consultation</p>
                            <p className="text-lg font-semibold text-emerald-700">
                                {format(new Date(consultation.dateConsultation), 'HH:mm', { locale: fr })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Aperçu
                    </TabsTrigger>
                    <TabsTrigger value="diagnosis" className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Diagnostic
                    </TabsTrigger>
                    <TabsTrigger value="treatment" className="flex items-center gap-2">
                        <Clipboard className="h-4 w-4" />
                        Traitement
                    </TabsTrigger>
                    <TabsTrigger value="prescription" className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Ordonnance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Motif */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                    Motif de consultation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">{consultation.motif}</p>
                            </CardContent>
                        </Card>

                        {/* Informations temporelles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-emerald-600" />
                                    Informations temporelles
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Date de consultation:</span>
                                    <span className="font-medium">
                                        {format(new Date(consultation.dateConsultation), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Créée le:</span>
                                    <span className="font-medium">
                                        {format(new Date(consultation.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Modifiée le:</span>
                                    <span className="font-medium">
                                        {format(new Date(consultation.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="diagnosis" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Diagnostics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Stethoscope className="h-5 w-5 text-emerald-600" />
                                    Diagnostics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {consultation.diagnostics ? (
                                    <p className="text-gray-700 leading-relaxed">{consultation.diagnostics}</p>
                                ) : (
                                    <p className="text-gray-500 italic">Aucun diagnostic renseigné</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Observations */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Eye className="h-5 w-5 text-emerald-600" />
                                    Observations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {consultation.observations ? (
                                    <p className="text-gray-700 leading-relaxed">{consultation.observations}</p>
                                ) : (
                                    <p className="text-gray-500 italic">Aucune observation renseignée</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="treatment" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clipboard className="h-5 w-5 text-emerald-600" />
                                Traitement prescrit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {consultation.traitementPrescrit ? (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 leading-relaxed">{consultation.traitementPrescrit}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Aucun traitement prescrit</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="prescription" className="space-y-6">
                    {consultation.ordonnances && consultation.ordonnances.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Pill className="h-5 w-5 text-emerald-600" />
                                    Ordonnance
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Émise le {format(new Date(consultation.ordonnances[0].dateEmission), 'dd/MM/yyyy', { locale: fr })}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {consultation.ordonnances[0].prescriptions.map((prescription, index) => (
                                        <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg">
                                            <div className="flex items-start justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900 text-lg">
                                                    {prescription.medicament?.nom || `Médicament ${index + 1}`}
                                                </h4>
                                                <Badge variant="outline" className="text-emerald-700">
                                                    #{index + 1}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <span className="text-sm font-medium text-gray-700 block mb-1">Posologie</span>
                                                    <p className="text-gray-900">{prescription.posologie}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <span className="text-sm font-medium text-gray-700 block mb-1">Durée</span>
                                                    <p className="text-gray-900">{prescription.duree}</p>
                                                </div>
                                                {prescription.instructions && (
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="text-sm font-medium text-gray-700 block mb-1">Instructions</span>
                                                        <p className="text-gray-900">{prescription.instructions}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Pill className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune ordonnance</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Aucune ordonnance n'a été prescrite pour cette consultation.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
} 