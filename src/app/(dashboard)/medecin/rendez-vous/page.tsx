"use client";
import { useEffect, useState } from "react";
import { rendezVousService } from "@/lib/services/rendez-vous.service";
import { consultationMedicaleService, ConsultationMedicale, PrescriptionDto } from "@/lib/services/consultation-medicale.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { fr } from 'date-fns/locale';
import { parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format as formatDate } from 'date-fns';
import { useRouter } from "next/navigation";
import { medicamentsService, MedicamentDto } from "@/lib/services/medicaments.service";

const locales = { 'fr': fr };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
    getDay,
    locales,
});

type CalendarEvent = {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: any;
};

export default function MedecinRendezVousPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [rdvs, setRdvs] = useState<any[]>([]);
    const [consultations, setConsultations] = useState<ConsultationMedicale[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConsultDialog, setShowConsultDialog] = useState(false);
    const [selectedRdv, setSelectedRdv] = useState<any | null>(null);
    const [calendarView, setCalendarView] = useState<View>("week");
    const [calendarDate, setCalendarDate] = useState<Date>(new Date());

    useEffect(() => {
        if (user?.utilisateurID) {
            fetchData(user.utilisateurID);
        }
    }, [user?.utilisateurID]);

    async function fetchData(medecinID: string) {
        setLoading(true);
        try {
            const [rdvsData, consultationsData] = await Promise.all([
                rendezVousService.getByMedecin(medecinID),
                consultationMedicaleService.getByMedecin(medecinID),
            ]);
            setRdvs(rdvsData);
            setConsultations(consultationsData);
        } finally {
            setLoading(false);
        }
    }

    // Map rdvs to calendar events
    const events: CalendarEvent[] = rdvs.map((rdv) => {
        const start = rdv.date && rdv.debutTime ? new Date(`${rdv.date}T${rdv.debutTime}`) : new Date();
        const end = rdv.date && rdv.endTime ? new Date(`${rdv.date}T${rdv.endTime}`) : new Date(start.getTime() + 30 * 60 * 1000);
        return {
            title: `${rdv.patient?.prenom || ''} ${rdv.patient?.nom || ''} - ${rdv.motif}`,
            start,
            end,
            allDay: false,
            resource: rdv,
        };
    });

    function handleSelectEvent(event: CalendarEvent) {
        const patientID = event.resource?.patient?.patientID;
        if (patientID) {
            router.push(`/medecin/patients/${patientID}`);
        }
        // else do nothing
    }

    function handleConsultationCreated() {
        if (user?.utilisateurID) fetchData(user.utilisateurID);
        setShowConsultDialog(false);
        setSelectedRdv(null);
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-emerald-700 tracking-tight">Mes Rendez-vous</h2>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border bg-white shadow">
                    <div style={{ height: 600 }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            titleAccessor="title"
                            style={{ height: 600 }}
                            messages={{
                                next: 'Suivant',
                                previous: 'Précédent',
                                today: "Aujourd'hui",
                                month: 'Mois',
                                week: 'Semaine',
                                day: 'Jour',
                                agenda: 'Agenda',
                                date: 'Date',
                                time: 'Heure',
                                event: 'Rendez-vous',
                                noEventsInRange: 'Aucun rendez-vous dans cette période.',
                            }}
                            culture="fr"
                            selectable={false}
                            onSelectEvent={handleSelectEvent}
                            view={calendarView}
                            onView={setCalendarView}
                            date={calendarDate}
                            onNavigate={setCalendarDate}
                            min={new Date(1970, 1, 1, 8, 0)}
                            max={new Date(1970, 1, 1, 21, 0)}
                            eventPropGetter={() => ({
                                style: {
                                    backgroundColor: '#059669',
                                    borderRadius: 8,
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 500,
                                    fontSize: 15,
                                    paddingLeft: 8,
                                    paddingRight: 8,
                                },
                            })}
                        />
                    </div>
                </div>
            )}
            <Dialog open={showConsultDialog} onOpenChange={setShowConsultDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Démarrer une consultation</DialogTitle>
                    </DialogHeader>
                    {selectedRdv && (
                        <ConsultationForm rdv={selectedRdv} onCreated={handleConsultationCreated} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ConsultationForm({ rdv, onCreated }: { rdv: any, onCreated: () => void }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        dossierID: rdv.patient?.dossierMedical?.dossierID || "",
        patientID: rdv.patient?.patientID || "",
        medecinID: user?.utilisateurID || "",
        dateConsultation: new Date().toISOString(),
        motif: rdv.motif || "",
        diagnostics: "",
        observations: "",
        traitementPrescrit: "",
        estTelemedicine: false,
        lienVisio: "",
        ordonnance: { prescriptions: [] as PrescriptionDto[] },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [medicamentOptions, setMedicamentOptions] = useState<MedicamentDto[][]>([]);
    const [medicamentSearch, setMedicamentSearch] = useState<string[]>([]);

    async function handleMedicamentSearch(index: number, value: string) {
        setMedicamentSearch(prev => {
            const arr = [...prev];
            arr[index] = value;
            return arr;
        });
        if (value.length > 1) {
            const results = await medicamentsService.autocomplete(value);
            setMedicamentOptions(prev => {
                const arr = [...prev];
                arr[index] = results;
                return arr;
            });
        } else {
            setMedicamentOptions(prev => {
                const arr = [...prev];
                arr[index] = [];
                return arr;
            });
        }
    }

    function handleSelectMedicament(index: number, medicament: MedicamentDto) {
        setForm(prev => {
            const prescriptions = [...prev.ordonnance.prescriptions];
            prescriptions[index] = { ...prescriptions[index], medicamentID: medicament.medicamentID, medicamentNom: medicament.nom };
            return { ...prev, ordonnance: { prescriptions } };
        });
        setMedicamentSearch(prev => {
            const arr = [...prev];
            arr[index] = medicament.nom;
            return arr;
        });
        setMedicamentOptions(prev => {
            const arr = [...prev];
            arr[index] = [];
            return arr;
        });
    }

    function handlePrescriptionChange(index: number, field: keyof PrescriptionDto, value: string) {
        setForm(prev => {
            const prescriptions = [...prev.ordonnance.prescriptions];
            prescriptions[index] = { ...prescriptions[index], [field]: value };
            return { ...prev, ordonnance: { prescriptions } };
        });
    }

    function handleAddPrescription() {
        setForm(prev => ({
            ...prev,
            ordonnance: { prescriptions: [...prev.ordonnance.prescriptions, { medicamentID: '', medicamentNom: '', posologie: '', duree: '', instructions: '' }] },
        }));
        setMedicamentSearch(prev => [...prev, '']);
        setMedicamentOptions(prev => [...prev, []]);
    }

    function handleRemovePrescription(index: number) {
        setForm(prev => {
            const prescriptions = [...prev.ordonnance.prescriptions];
            prescriptions.splice(index, 1);
            return { ...prev, ordonnance: { prescriptions } };
        });
        setMedicamentSearch(prev => prev.filter((_, i) => i !== index));
        setMedicamentOptions(prev => prev.filter((_, i) => i !== index));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Always set medecinID from user before submit
            const medecinID = user?.utilisateurID || form.medecinID;
            // Prepare prescriptions for backend (strip medicamentNom)
            const prescriptions = form.ordonnance.prescriptions.map(({ medicamentID, posologie, duree, instructions }) => ({ medicamentID, posologie, duree, instructions }));
            const payload = {
                dossierID: form.dossierID,
                medecinID,
                dateConsultation: form.dateConsultation,
                motif: form.motif,
                diagnostics: form.diagnostics,
                observations: form.observations,
                traitementPrescrit: form.traitementPrescrit,
                estTelemedicine: form.estTelemedicine,
                lienVisio: form.lienVisio,
                ordonnance: prescriptions.length ? { prescriptions } : undefined,
            };
            if (!prescriptions.length) {
                delete payload.ordonnance;
            }
            await consultationMedicaleService.create(payload);
            toast.success("Consultation créée avec succès");
            onCreated();
        } catch (err) {
            setError("Erreur lors de la création de la consultation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <label className="block text-sm font-medium mb-1">Motif</label>
                <input name="motif" value={form.motif} onChange={handleChange} required className="border rounded px-2 py-2 w-full" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Diagnostics</label>
                <textarea name="diagnostics" value={form.diagnostics} onChange={handleChange} required className="border rounded px-2 py-2 w-full min-h-[38px]" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <textarea name="observations" value={form.observations} onChange={handleChange} className="border rounded px-2 py-2 w-full min-h-[38px]" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Traitement prescrit</label>
                <textarea name="traitementPrescrit" value={form.traitementPrescrit} onChange={handleChange} className="border rounded px-2 py-2 w-full min-h-[38px]" />
            </div>
            <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-md font-semibold">Ordonnance (optionnelle)</label>
                    <button type="button" onClick={handleAddPrescription} className="text-emerald-700 hover:underline text-sm">Ajouter une prescription</button>
                </div>
                {form.ordonnance.prescriptions.length === 0 && <div className="text-gray-400 text-sm">Aucune prescription ajoutée.</div>}
                {form.ordonnance.prescriptions.map((pres, idx) => (
                    <div key={idx} className="mb-4 p-3 border rounded bg-gray-50 relative">
                        <button type="button" onClick={() => handleRemovePrescription(idx)} className="absolute top-2 right-2 text-red-500 text-xs">Supprimer</button>
                        <div className="mb-2">
                            <label className="block text-xs font-medium mb-1">Médicament</label>
                            <input
                                type="text"
                                value={medicamentSearch[idx] || ''}
                                onChange={e => handleMedicamentSearch(idx, e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                                placeholder="Rechercher un médicament..."
                                autoComplete="off"
                            />
                            {medicamentOptions[idx] && medicamentOptions[idx].length > 0 && (
                                <div className="absolute z-10 bg-white border rounded shadow mt-1 w-full max-h-40 overflow-y-auto">
                                    {medicamentOptions[idx].map(med => (
                                        <div
                                            key={med.medicamentID}
                                            className="px-2 py-1 cursor-pointer hover:bg-emerald-100"
                                            onClick={() => handleSelectMedicament(idx, med)}
                                        >
                                            {med.nom}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {pres.medicamentID && (
                                <div className="text-xs text-emerald-700 mt-1">Sélectionné : {pres.medicamentNom}</div>
                            )}
                        </div>
                        <div className="mb-2">
                            <label className="block text-xs font-medium mb-1">Posologie</label>
                            <input type="text" value={pres.posologie} onChange={e => handlePrescriptionChange(idx, 'posologie', e.target.value)} className="border rounded px-2 py-1 w-full" required />
                        </div>
                        <div className="mb-2">
                            <label className="block text-xs font-medium mb-1">Durée</label>
                            <input type="text" value={pres.duree} onChange={e => handlePrescriptionChange(idx, 'duree', e.target.value)} className="border rounded px-2 py-1 w-full" required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Instructions</label>
                            <input type="text" value={pres.instructions} onChange={e => handlePrescriptionChange(idx, 'instructions', e.target.value)} className="border rounded px-2 py-1 w-full" required />
                        </div>
                    </div>
                ))}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Créer la consultation"}
                </Button>
            </div>
        </form>
    );
}