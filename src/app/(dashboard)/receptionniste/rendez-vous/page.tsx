"use client";
import { useEffect, useState } from "react";
import { rendezVousService, RendezVous as RendezVousApi } from "@/lib/services/rendez-vous.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams, useRouter } from "next/navigation";
import { usersService, User } from "@/lib/services/users.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { patientsService, Patient } from "@/lib/services/patients.service";
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { parse } from 'date-fns';
import { startOfWeek } from 'date-fns';
import { getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format as formatDate } from 'date-fns';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

interface RendezVous extends RendezVousApi {
  date?: string;
  heure?: string;
  debutTime?: string;
  endTime?: string;
}

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: RendezVous;
};

function RendezVousForm({ 
  patientID, 
  onCreated, 
  initialDateHeure, 
  initialEndHeure, 
  existingAppointments = [] 
}: { 
  patientID?: string, 
  onCreated: () => void, 
  initialDateHeure?: string, 
  initialEndHeure?: string,
  existingAppointments?: RendezVous[]
}) {
  const { user } = useAuth();
  const router = useRouter();
  let initialDate = "";
  let initialDebutTime = "";
  let initialEndTime = "";
  if (initialDateHeure) {
    const [datePart, timePart] = initialDateHeure.split('T');
    initialDate = datePart;
    initialDebutTime = timePart || "";
  }
  if (initialEndHeure) {
    const [, timePart] = initialEndHeure.split('T');
    initialEndTime = timePart || "";
  }
  const [form, setForm] = useState({
    patientID: patientID || "",
    medecinID: "",
    date: initialDate,
    debutTime: initialDebutTime,
    endTime: initialEndTime,
    motif: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medecins, setMedecins] = useState<User[]>([]);
  const [radiologues, setRadiologues] = useState<User[]>([]);
  const [searchMedecin, setSearchMedecin] = useState("");
  const [openCombo, setOpenCombo] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchPatient, setSearchPatient] = useState("");
  const [openPatientCombo, setOpenPatientCombo] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, patientID: patientID || "" }));
  }, [patientID]);

  useEffect(() => {
    if (initialDateHeure) {
      const [datePart, timePart] = initialDateHeure.split('T');
      let newState: any = { date: datePart, debutTime: timePart || "" };
      if (initialEndHeure) {
        const [, endTimePart] = initialEndHeure.split('T');
        newState.endTime = endTimePart || "";
      }
      setForm((prev) => ({ ...prev, ...newState }));
    }
  }, [initialDateHeure, initialEndHeure]);

  useEffect(() => {
    // Utilise user.etablissementID directement (champ existant dans User)
    const etabId = user?.etablissementID;
    if (etabId) {
      Promise.all([
        usersService.getMedecinsByEtablissement(etabId),
        usersService.getRadiologuesByEtablissement(etabId)
      ]).then(([medecinsData, radiologuesData]) => {
        setMedecins(medecinsData);
        setRadiologues(radiologuesData);
      });
    } else {
      setMedecins([]);
      setRadiologues([]);
    }
  }, [user?.etablissementID]);

  useEffect(() => {
    patientsService.getAll()
      .then(setPatients)
      .catch(error => {
        console.error('Erreur lors du fetch des patients:', error);
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data);
        setPatients([]);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Check for time conflicts with the same professional
    if (form.medecinID && form.date && form.debutTime && form.endTime) {
      const newStart = new Date(`${form.date}T${form.debutTime}`);
      const newEnd = new Date(`${form.date}T${form.endTime}`);
      
      const hasConflict = existingAppointments.some((rdv: RendezVous) => {
        // Only check conflicts with the same professional
        if (rdv.medecin?.utilisateurID !== form.medecinID) {
          return false;
        }
        
        // Check if the dates are the same
        if (rdv.date !== form.date) {
          return false;
        }
        
        // Check for time overlap
        const existingStart = new Date(`${rdv.date}T${rdv.debutTime}`);
        const existingEnd = new Date(`${rdv.date}T${rdv.endTime}`);
        
        return (newStart < existingEnd && newEnd > existingStart);
      });
      
      if (hasConflict) {
        toast.error("Ce professionnel a déjà un rendez-vous sur ce créneau horaire.");
        setLoading(false);
        return;
      }
    }
    
    try {
      await rendezVousService.create({
        patientID: form.patientID,
        medecinID: form.medecinID,
        date: form.date,
        debutTime: form.debutTime,
        endTime: form.endTime,
        motif: form.motif,
      });
      toast.success("Rendez-vous créé avec succès");
      onCreated();
      router.push("/receptionniste/rendez-vous");
    } catch (err: any) {
      setError("Erreur lors de la création du rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage dynamique des médecins et radiologues selon la recherche
  const allProfessionals = [...medecins, ...radiologues];
  const filteredProfessionals = allProfessionals.filter((m) => {
    const searchStr = `${m.prenom} ${m.nom} ${m.email || ''} ${m.telephone || ''}`.toLowerCase();
    return searchStr.includes(searchMedecin.toLowerCase());
  }).slice(0, 8);

  // Filtrage dynamique des patients selon la recherche
  const filteredPatients = patients.filter((p) => {
    const searchStr = `${p.prenom} ${p.nom} ${p.email || ''} ${p.telephone || ''}`.toLowerCase();
    return searchStr.includes(searchPatient.toLowerCase());
  }).slice(0, 8);

  // Fonction pour trouver le professionnel sélectionné
  const getSelectedProfessional = () => {
    return allProfessionals.find((m) => m.utilisateurID === form.medecinID);
  };

  // Fonction pour obtenir le type de professionnel
  const getProfessionalType = (user: User) => {
    return user.role === 'RADIOLOGUE' ? 'Radiologue' : 'Médecin';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-6 border space-y-4">
      {/*<h3 className="text-lg font-semibold mb-2">Créer un rendez-vous</h3>*/}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          <div className="relative">
            <button
              type="button"
              className="border rounded px-2 py-2 w-full text-left bg-white"
              onClick={() => setOpenPatientCombo(true)}
            >
              {form.patientID
                ? (() => {
                    const p = patients.find((p) => p.patientID === form.patientID);
                    return p
                      ? `${p.prenom} ${p.nom} • ${p.dateNaissance || ''} • ${p.email || p.telephone || ''}`
                      : "Sélectionner un patient...";
                  })()
                : "Sélectionner un patient..."}
            </button>
            {openPatientCombo && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Rechercher un patient..."
                    value={searchPatient}
                    onChange={e => setSearchPatient(e.target.value)}
                    className="border rounded px-2 py-1 w-full mb-2"
                    autoFocus
                  />
                  {filteredPatients.length === 0 && (
                    <div className="text-gray-400 text-sm p-2">Aucun patient trouvé.</div>
                  )}
                  {filteredPatients.map((p) => (
                    <div
                      key={p.patientID}
                      className={`p-2 cursor-pointer hover:bg-emerald-50 rounded flex flex-col ${form.patientID === p.patientID ? 'bg-emerald-100' : ''}`}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, patientID: p.patientID }));
                        setOpenPatientCombo(false);
                      }}
                    >
                      <span className="font-medium">{p.prenom} {p.nom}</span>
                      <span className="text-xs text-gray-500">{p.dateNaissance ? `Né(e) le ${p.dateNaissance}` : ''}</span>
                      <span className="text-xs text-gray-500">{p.email || p.telephone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input type="hidden" name="patientID" value={form.patientID} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Médecin/Radiologue</label>
          <div className="relative">
            <button
              type="button"
              className="border rounded px-2 py-2 w-full text-left bg-white"
              onClick={() => setOpenCombo(true)}
            >
              {form.medecinID
                ? (() => {
                    const m = getSelectedProfessional();
                    return m
                      ? `${m.prenom} ${m.nom} (${getProfessionalType(m)}) • ${m.email || m.telephone || ''}`
                      : "Sélectionner un professionnel...";
                  })()
                : "Sélectionner un médecin ou radiologue..."}
            </button>
            {openCombo && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Rechercher un médecin ou radiologue..."
                    value={searchMedecin}
                    onChange={e => setSearchMedecin(e.target.value)}
                    className="border rounded px-2 py-1 w-full mb-2"
                    autoFocus
                  />
                  {filteredProfessionals.length === 0 && (
                    <div className="text-gray-400 text-sm p-2">Aucun professionnel trouvé.</div>
                  )}
                  {filteredProfessionals.map((m) => (
                    <div
                      key={m.utilisateurID}
                      className={`p-2 cursor-pointer hover:bg-emerald-50 rounded flex flex-col ${form.medecinID === m.utilisateurID ? 'bg-emerald-100' : ''}`}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, medecinID: m.utilisateurID }));
                        setOpenCombo(false);
                      }}
                    >
                      <span className="font-medium">{m.prenom} {m.nom}</span>
                      <span className="text-xs text-gray-500">{getProfessionalType(m)} • {m.email || m.telephone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input type="hidden" name="medecinID" value={form.medecinID} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input name="date" type="date" value={form.date} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heure de début</label>
            <Input name="debutTime" type="time" value={form.debutTime} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heure de fin</label>
            <Input name="endTime" type="time" value={form.endTime} onChange={handleChange} required />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Motif</label>
        <textarea name="motif" value={form.motif} onChange={handleChange} required className="border rounded px-2 py-2 w-full min-h-[38px]" placeholder="Motif du rendez-vous" />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Créer le rendez-vous"}
        </Button>
      </div>
    </form>
  );
}

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

export default function ReceptionnisteRendezVousPage() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const patientID = searchParams.get("patientID") || undefined;
  const [showForm, setShowForm] = useState(!!patientID);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  const [calendarView, setCalendarView] = useState<View>("week");
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchRdvs();
  }, []);

  function handleCreated() {
    fetchRdvs();
    setDialogOpen(false);
    setSelectedSlot(null);
  }

  async function fetchRdvs() {
    setLoading(true);
    try {
      const data = await rendezVousService.getAll();
      setRdvs(data);
    } finally {
      setLoading(false);
    }
  }

  const filteredRdvs = rdvs.filter((rdv) => {
    const searchStr = `${rdv.patient?.prenom || ""} ${rdv.patient?.nom || ""} ${rdv.medecin?.prenom || ""} ${rdv.medecin?.nom || ""}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  // Map rdvs to calendar events
  const events: CalendarEvent[] = filteredRdvs.map((rdv) => {
    const start = rdv.date && rdv.debutTime ? new Date(`${rdv.date}T${rdv.debutTime}`) : new Date();
    const end = rdv.date && rdv.endTime ? new Date(`${rdv.date}T${rdv.endTime}`) : new Date(start.getTime() + 30 * 60 * 1000);
    return {
      title: `${rdv.patient?.prenom || ''} ${rdv.patient?.nom || ''} avec Dr. ${rdv.medecin?.prenom || ''} ${rdv.medecin?.nom || ''} - ${rdv.motif}`,
      start,
      end,
      allDay: false,
      resource: rdv,
    };
  });

  async function handleEventResize({ event, start, end }: { event: CalendarEvent, start: Date | string, end: Date | string }) {
    // Ensure start and end are Date objects
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    // Update the event in the backend
    // Extract date, debutTime, endTime from new start/end
    const date = startDate.toISOString().slice(0, 10);
    const debutTime = startDate.toTimeString().slice(0, 5);
    const endTime = endDate.toTimeString().slice(0, 5);
    try {
      await rendezVousService.update(event.resource.rendezVousID, {
        date,
        debutTime,
        endTime,
      });
      toast.success('Rendez-vous mis à jour');
      fetchRdvs();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du rendez-vous');
    }
  }

  async function handleEventDrop({ event, start, end }: { event: CalendarEvent, start: Date | string, end: Date | string }) {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    const date = startDate.toISOString().slice(0, 10);
    const debutTime = startDate.toTimeString().slice(0, 5);
    const endTime = endDate.toTimeString().slice(0, 5);
    try {
      await rendezVousService.update(event.resource.rendezVousID, {
        date,
        debutTime,
        endTime,
      });
      toast.success('Rendez-vous déplacé');
      fetchRdvs();
    } catch (err) {
      toast.error('Erreur lors du déplacement du rendez-vous');
    }
  }

  return (
    <div className="space-y-6">
      {!patientID && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          {/*<DialogTrigger asChild>*/}
          {/*  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mb-2">Créer un rendez-vous</Button>*/}
          {/*</DialogTrigger>*/}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un rendez-vous</DialogTitle>
            </DialogHeader>
            <RendezVousForm
              onCreated={handleCreated}
              initialDateHeure={selectedSlot ? formatDate(selectedSlot.start, "yyyy-MM-dd'T'HH:mm") : undefined}
              initialEndHeure={selectedSlot && selectedSlot.end ? formatDate(selectedSlot.end, "yyyy-MM-dd'T'HH:mm") : undefined}
              existingAppointments={rdvs}
            />
          </DialogContent>
        </Dialog>
      )}
      {patientID && <RendezVousForm patientID={patientID} onCreated={handleCreated} existingAppointments={rdvs} />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-emerald-700 tracking-tight">Rendez-vous</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center mb-2 md:mb-4 md:justify-between">
        <Input
          placeholder="Rechercher par patient ou médecin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          onClick={() => {
            setSelectedSlot(null);
            setDialogOpen(true);
          }}
        >
          Nouveau rendez-vous
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <div style={{ height: 600 }}>
          <DnDCalendar
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
            selectable
            onSelectSlot={(slotInfo) => {
              // Check for overlap with existing events for the same professional
              // We'll need to get the selected professional from the form
              // For now, we'll allow the creation and let the backend handle the validation
              setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
              setDialogOpen(true);
            }}
            view={calendarView}
            onView={setCalendarView}
            date={calendarDate}
            onNavigate={setCalendarDate}
            min={new Date(1970, 1, 1, 8, 0)}
            max={new Date(1970, 1, 1, 21, 0)}
            resizable
            onEventResize={handleEventResize}
            onEventDrop={handleEventDrop}
            eventPropGetter={(event) => {
              // Check if there are multiple appointments that overlap in time (including partial overlaps)
              const overlappingEvents = events.filter(e => {
                // Check if events overlap in time (any overlap, not just exact same times)
                return (e.start < event.end && e.end > event.start);
              });
              
              const isOverlapping = overlappingEvents.length > 1;
              
              // Define different colors for overlapping events
              const overlapColors = [
                '#f59e0b', // Orange
                '#3b82f6', // Blue
                '#8b5cf6', // Purple
                '#ef4444', // Red
                '#10b981', // Emerald
                '#f97316', // Orange-500
                '#06b6d4', // Cyan
                '#84cc16', // Lime
              ];
              
              let backgroundColor = '#059669'; // Default green for single events
              
              if (isOverlapping) {
                // Find the index of this event in the overlapping events array
                const eventIndex = overlappingEvents.findIndex(e => 
                  e.resource.rendezVousID === event.resource.rendezVousID
                );
                // Use the color based on index, cycling through the colors if needed
                backgroundColor = overlapColors[eventIndex % overlapColors.length];
              }
              
              return {
                style: {
                  backgroundColor,
                  borderRadius: 8,
                  color: 'white',
                  border: 'none',
                  fontWeight: 500,
                  fontSize: 15,
                  paddingLeft: 8,
                  paddingRight: 8,
                  opacity: isOverlapping ? 0.9 : 1,
                },
              };
            }}
          />
        </div>
      </div>
      
      {/* Legend for calendar colors */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-600 rounded"></div>
          <span>Rendez-vous unique</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Rendez-vous simultané:</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <div className="w-3 h-3 bg-red-500 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 