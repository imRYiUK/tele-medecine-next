"use client";
import { useEffect, useState } from "react";
import { rendezVousService } from "@/lib/services/rendez-vous.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from "next/navigation";

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

export default function RadiologueRendezVousPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [rdvs, setRdvs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [calendarView, setCalendarView] = useState<View>("week");
    const [calendarDate, setCalendarDate] = useState<Date>(new Date());

    useEffect(() => {
        if (user?.utilisateurID) {
            fetchData(user.utilisateurID);
        }
    }, [user?.utilisateurID]);

    async function fetchData(radiologueID: string) {
        setLoading(true);
        try {
            const rdvsData = await rendezVousService.getByRadiologue(radiologueID);
            setRdvs(rdvsData);
        } catch (error) {
            console.error('Erreur lors du chargement des rendez-vous:', error);
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
            router.push(`/radiologue/examens?patientID=${patientID}`);
        }
    }

    function handleSelectSlot(slotInfo: any) {
        // Optionally handle slot selection for creating new appointments
        console.log('Slot selected:', slotInfo);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
                    <p className="text-gray-600">Gérez vos rendez-vous radiologiques</p>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant={calendarView === "day" ? "default" : "outline"}
                        onClick={() => setCalendarView("day")}
                    >
                        Jour
                    </Button>
                    <Button
                        variant={calendarView === "week" ? "default" : "outline"}
                        onClick={() => setCalendarView("week")}
                    >
                        Semaine
                    </Button>
                    <Button
                        variant={calendarView === "month" ? "default" : "outline"}
                        onClick={() => setCalendarView("month")}
                    >
                        Mois
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }}
                        view={calendarView}
                        onView={setCalendarView}
                        date={calendarDate}
                        onNavigate={setCalendarDate}
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        selectable
                        min={new Date(1970, 1, 1, 8, 0)}
                        max={new Date(1970, 1, 1, 21, 0)}
                        messages={{
                            next: "Suivant",
                            previous: "Précédent",
                            today: "Aujourd'hui",
                            month: "Mois",
                            week: "Semaine",
                            day: "Jour",
                            agenda: "Agenda",
                            date: "Date",
                            time: "Heure",
                            event: "Événement",
                            noEventsInRange: "Aucun rendez-vous dans cette période.",
                        }}
                        eventPropGetter={(event) => ({
                            style: {
                                backgroundColor: '#3b82f6',
                                borderColor: '#2563eb',
                                color: 'white',
                            },
                        })}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendez-vous à venir</h2>
                    <div className="space-y-3">
                        {rdvs
                            .filter(rdv => {
                                const rdvDate = new Date(`${rdv.date}T${rdv.debutTime}`);
                                return rdvDate >= new Date();
                            })
                            .sort((a, b) => {
                                const dateA = new Date(`${a.date}T${a.debutTime}`);
                                const dateB = new Date(`${b.date}T${b.debutTime}`);
                                return dateA.getTime() - dateB.getTime();
                            })
                            .slice(0, 5)
                            .map((rdv) => (
                                <div
                                    key={rdv.rendezVousID}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                        const patientID = rdv.patient?.patientID;
                                        if (patientID) {
                                            router.push(`/radiologue/examens?patientID=${patientID}`);
                                        }
                                    }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold">
                                                    {rdv.patient?.prenom?.[0]}{rdv.patient?.nom?.[0]}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {rdv.patient?.prenom} {rdv.patient?.nom}
                                            </p>
                                            <p className="text-sm text-gray-500">{rdv.motif}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {format(new Date(`${rdv.date}T${rdv.debutTime}`), 'dd/MM/yyyy', { locale: fr })}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(`${rdv.date}T${rdv.debutTime}`), 'HH:mm', { locale: fr })} - {format(new Date(`${rdv.date}T${rdv.endTime}`), 'HH:mm', { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        {rdvs.filter(rdv => {
                            const rdvDate = new Date(`${rdv.date}T${rdv.debutTime}`);
                            return rdvDate >= new Date();
                        }).length === 0 && (
                            <p className="text-gray-500 text-center py-4">Aucun rendez-vous à venir</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 