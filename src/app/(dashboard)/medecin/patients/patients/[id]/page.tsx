"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { patientsService, Patient } from "@/lib/services/patients.service";
import { consultationMedicaleService, ConsultationMedicale, PrescriptionDto } from "@/lib/services/consultation-medicale.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, X, Calendar, User, FileText, Pill } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { medicamentsService, MedicamentDto } from "@/lib/services/medicaments.service";
import { Badge } from "@/components/ui/badge";

export default function MedecinPatientDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [consultations, setConsultations] = useState<ConsultationMedicale[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConsultDialog, setShowConsultDialog] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<ConsultationMedicale | null>(null);

    useEffect(() => {
        if (id) {
            fetchData(id as string, user?.utilisateurID || "");
        }
    }, [id, user?.utilisateurID]);

    async function fetchData(patientID: string, medecinID: string) {
        setLoading(true);
        try {
            const [patientData, consultationsData] = await Promise.all([
                patientsService.getById(patientID),
                consultationMedicaleService.getByPatient(patientID),
            ]);
            setPatient(patientData);
            setConsultations(consultationsData);
        } finally {
            setLoading(false);
        }
    }

    function handleConsultationCreated() {
        if (id && user?.utilisateurID) fetchData(id as string, user.utilisateurID);
        setShowConsultDialog(false);
    }

    return (
        <div className="space-y-6 p-6">
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
                </div>
            ) : patient ? (
                <>
                    <div className="bg-white rounded shadow p-4 border space-y-2">
                        <h2 className="text-2xl font-bold text-emerald-700 mb-2">{patient.prenom} {patient.nom}</h2>
                        <div>Email: {patient.email}</div>
                        <div>Téléphone: {patient.telephone}</div>
                        <div>Date de naissance: {patient.dateNaissance}</div>
                        <div>Groupe sanguin: {patient.groupeSanguin}</div>
                        <div>Genre: {patient.genre}</div>
                        <div className="mt-4">
                            <Button onClick={() => setShowConsultDialog(true)}>
                                Nouvelle consultation
                            </Button>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4 border space-y-2">
                        <h3 className="text-xl font-semibold mb-2">Consultations avec ce patient</h3>
                        {consultations.length === 0 ? (
                            <div className="text-gray-500">Aucune consultation trouvée.</div>
                        ) : (
                            <div className="space-y-3">
                                {consultations.map(consult => (
                                    <div
                                        key={consult.consultationID}
                                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedConsultation(consult)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-emerald-600" />
                                                <div>
                                                    <div className="font-medium text-lg">
                                                        {format(new Date(consult.dateConsultation), "dd/MM/yyyy à HH:mm", { locale: fr })}
                                                    </div>
                                                    <div className="text-sm text-gray-600">Motif: {consult.motif}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {consult.estTelemedicine && (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                        Télémédecine
                                                    </Badge>
                                                )}
                                                {consult.ordonnances && consult.ordonnances.length > 0 && (
                                                    <Badge variant="outline" className="border-green-200 text-green-700">
                                                        Ordonnance
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dialog pour nouvelle consultation */}
                    <Dialog open={showConsultDialog} onOpenChange={setShowConsultDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nouvelle consultation</DialogTitle>
                            </DialogHeader>
                            <ConsultationForm patient={patient} medecinID={user?.utilisateurID || ""} onCreated={handleConsultationCreated} />
                        </DialogContent>
                    </Dialog>

                    {/* Dialog pour afficher les détails d'une consultation */}
                    <Dialog open={!!selectedConsultation} onOpenChange={() => setSelectedConsultation(null)}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Détails de la consultation
                                </DialogTitle>
                            </DialogHeader>
                            {selectedConsultation && (
                                <ConsultationDetails consultation={selectedConsultation} />
                            )}
                        </DialogContent>
                    </Dialog>
                </>
            ) : (
                <div className="text-gray-500">Patient introuvable.</div>
            )}
        </div>
    );
}

function ConsultationDetails({ consultation }: { consultation: ConsultationMedicale }) {
    return (
        <div className="space-y-6">
            {/* En-tête avec informations de base */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-emerald-600" />
                        <div>
                            <h3 className="text-lg font-semibold">
                                {consultation.dossier?.patient?.prenom} {consultation.dossier?.patient?.nom}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {format(new Date(consultation.dateConsultation), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
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
            </div>

            {/* Motif */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-2">Motif de la consultation</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{consultation.motif}</p>
            </div>

            {/* Diagnostics */}
            {consultation.diagnostics && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Diagnostics</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{consultation.diagnostics}</p>
                </div>
            )}

            {/* Observations */}
            {consultation.observations && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Observations</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{consultation.observations}</p>
                </div>
            )}

            {/* Traitement prescrit */}
            {consultation.traitementPrescrit && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Traitement prescrit</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{consultation.traitementPrescrit}</p>
                </div>
            )}

            {/* Ordonnance */}
            {consultation.ordonnances && consultation.ordonnances.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Ordonnance
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Date d'émission:</span> {format(new Date(consultation.ordonnances[0].dateEmission), "dd/MM/yyyy", { locale: fr })}
                        </div>
                        <div className="space-y-4">
                            {consultation.ordonnances[0].prescriptions.map((prescription, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border">
                                    <div className="font-medium text-gray-900 mb-2">
                                        {prescription.medicament?.nom || `Médicament ${index + 1}`}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Posologie:</span>
                                            <p className="text-gray-600">{prescription.posologie}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Durée:</span>
                                            <p className="text-gray-600">{prescription.duree}</p>
                                        </div>
                                        {prescription.instructions && (
                                            <div>
                                                <span className="font-medium text-gray-700">Instructions:</span>
                                                <p className="text-gray-600">{prescription.instructions}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Informations supplémentaires */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Informations supplémentaires</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Consultation créée le:</span>
                        <p className="text-gray-600">{format(new Date(consultation.createdAt), "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Dernière modification:</span>
                        <p className="text-gray-600">{format(new Date(consultation.updatedAt), "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConsultationForm({ patient, medecinID, onCreated }: { patient: any, medecinID: string, onCreated: () => void }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        dossierID: patient.dossierMedical?.dossierID || "",
        patientID: patient.patientID || "",
        medecinID: medecinID || "",
        dateConsultation: new Date().toISOString(),
        motif: "",
        diagnostics: "",
        observations: "",
        traitementPrescrit: "",
        estTelemedicine: false,
        lienVisio: "",
        ordonnance: { prescriptions: [] as PrescriptionDto[] },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Add state for medication search/autocomplete
    const [medicamentOptions, setMedicamentOptions] = useState<MedicamentDto[][]>([]); // Array per prescription
    const [medicamentSearch, setMedicamentSearch] = useState<string[]>([]); // Array per prescription

    // Prescription handlers
    function handlePrescriptionChange(index: number, field: keyof PrescriptionDto, value: string) {
        setForm(prev => {
            const prescriptions = [...prev.ordonnance.prescriptions];
            prescriptions[index] = { ...prescriptions[index], [field]: value };
            return { ...prev, ordonnance: { prescriptions } };
        });
    }
    // Update handlers for medication search
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
                delete (payload as any).ordonnance;
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
            {/* Ordonnance section */}
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