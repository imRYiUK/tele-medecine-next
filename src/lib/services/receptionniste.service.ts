import { api } from '@/lib/api';
import { patientsService, Patient } from './patients.service';
import { rendezVousService, RendezVous } from './rendez-vous.service';

export interface ReceptionnisteStats {
  totalPatients: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  pendingAppointments: number;
}

export interface DashboardData {
  stats: ReceptionnisteStats;
  recentAppointments: RendezVous[];
  recentPatients: Patient[];
}

export const receptionnisteService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Fetch all data in parallel
      const [patientsData, appointmentsData] = await Promise.all([
        patientsService.getAll(),
        rendezVousService.getAll()
      ]);

      // Calculate statistics
      const today = new Date().toISOString().slice(0, 10);
      const todayAppointments = appointmentsData.filter(apt => {
        const appointmentDate = new Date(apt.dateHeure).toISOString().slice(0, 10);
        return appointmentDate === today;
      });
      
      const thisWeek = getWeekDates();
      const thisWeekAppointments = appointmentsData.filter(apt => {
        const appointmentDate = new Date(apt.dateHeure).toISOString().slice(0, 10);
        return thisWeek.includes(appointmentDate);
      });

      const pendingAppointments = appointmentsData.filter(apt => {
        const appointmentDateTime = new Date(apt.dateHeure);
        return appointmentDateTime > new Date();
      });

      const stats: ReceptionnisteStats = {
        totalPatients: patientsData.length,
        appointmentsToday: todayAppointments.length,
        appointmentsThisWeek: thisWeekAppointments.length,
        pendingAppointments: pendingAppointments.length
      };

      // Get recent appointments (next 5 upcoming)
      const recentAppointments = appointmentsData
        .filter(apt => {
          const appointmentDateTime = new Date(apt.dateHeure);
          return appointmentDateTime >= new Date();
        })
        .sort((a, b) => {
          const dateA = new Date(a.dateHeure);
          const dateB = new Date(b.dateHeure);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 5);

      // Get recent patients (last 5 created/modified)
      const recentPatients = patientsData.slice(0, 5);

      return {
        stats,
        recentAppointments,
        recentPatients
      };
    } catch (error) {
      console.error('Error fetching receptionist dashboard data:', error);
      throw error;
    }
  },

  async getPatientsByEtablissement(etablissementID: string): Promise<Patient[]> {
    try {
      const res = await api.get(`/patients/etablissement/${etablissementID}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching patients by establishment:', error);
      throw error;
    }
  },

  async getAppointmentsByEtablissement(etablissementID: string): Promise<RendezVous[]> {
    try {
      const res = await api.get(`/rendez-vous/etablissement/${etablissementID}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching appointments by establishment:', error);
      throw error;
    }
  }
};

// Helper function to get week dates
function getWeekDates(): string[] {
  const dates = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
} 