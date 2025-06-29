"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Activity, AlertTriangle } from 'lucide-react';
import { rendezVousService } from '@/lib/services/rendez-vous.service';
import { consultationMedicaleService, ConsultationMedicale } from '@/lib/services/consultation-medicale.service';
import { useAuth } from '@/lib/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from "next/link";

export default function MedecinDashboardPage() {
    const { user } = useAuth();
    const [rdvs, setRdvs] = useState<any[]>([]);
    const [consultations, setConsultations] = useState<ConsultationMedicale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user?.utilisateurID) {
                    setError('Aucun utilisateur connecté');
                    setLoading(false);
                    return;
                }
                const [rdvsData, consultationsData] = await Promise.all([
                    rendezVousService.getByMedecin(user.utilisateurID),
                    consultationMedicaleService.getByMedecin(user.utilisateurID)
                ]);
                setRdvs(rdvsData);
                setConsultations(consultationsData);
            } catch (err) {
                setError('Erreur lors du chargement des statistiques');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.utilisateurID) fetchData();
    }, [user?.utilisateurID]);

    const today = new Date().toISOString().slice(0, 10);
    const todaysRdvs = rdvs.filter(r => r.date === today);
    const totalPatients = Array.from(new Set(rdvs.map(rdv => rdv.patient?.patientID))).filter(Boolean).length;
    const recentConsults = consultations.slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600 text-lg font-semibold">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Tableau de bord Médecin</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-lg bg-white border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-semibold text-gray-900">Patients</CardTitle>
                        <Users className="h-6 w-6 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary mb-1">{totalPatients}</div>
                        <p className="text-sm text-gray-500">Patients suivis</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg bg-white border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-semibold text-gray-900">Consultations</CardTitle>
                        <Activity className="h-6 w-6 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary mb-1">{consultations.length}</div>
                        <p className="text-sm text-gray-500">Consultations réalisées</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg bg-white border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-semibold text-gray-900">Rendez-vous aujourd'hui</CardTitle>
                        <Calendar className="h-6 w-6 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary mb-1">{todaysRdvs.length}</div>
                        <p className="text-sm text-gray-500">Rendez-vous prévus aujourd'hui</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg bg-white border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-semibold text-gray-900">Alertes</CardTitle>
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary mb-1">0</div>
                        <p className="text-sm text-gray-500">Alertes en attente</p>
                    </CardContent>
                </Card>
            </div>
            <Card className="shadow-lg bg-white border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Consultations récentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentConsults.length ? recentConsults.map((consult) => (
                            <div key={consult.consultationID} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                <div className="space-y-1">
                                    <p className="text-base font-semibold text-gray-800">
                                        {consult.patient?.prenom} {consult.patient?.nom}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {consult.motif}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {format(new Date(consult.dateConsultation), 'PPp', { locale: fr })}
                                </div>
                            </div>
                        )) : <div className="text-gray-400 text-sm">Aucune consultation récente</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}