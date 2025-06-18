import { api } from '@/lib/api';

export interface DashboardStats {
  totalUsers: number;
  totalEstablishments: number;
  totalActivities: number;
  recentActivities: Array<{
    id: string;
    typeAction: string;
    description: string;
    dateAction: string;
    utilisateur: {
      nom: string;
      prenom: string;
      email: string;
      role: string;
    };
  }>;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      // Récupérer les établissements
      const establishmentsResponse = await api.get('/etablissements');
      const totalEstablishments = establishmentsResponse.data.length;

      // Récupérer les utilisateurs
      const usersResponse = await api.get('/users');
      const totalUsers = usersResponse.data.length;

      // Récupérer les activités récentes
      const activitiesResponse = await api.get('/journal');
      const activities = activitiesResponse.data.map((activity: any) => ({
        ...activity,
        id: `activity-${activity.journalActiviteID || Math.random().toString(36).substr(2, 9)}`
      }));
      const totalActivities = activities.length;
      const recentActivities = activities.slice(0, 5); // 5 activités les plus récentes

      return {
        totalUsers,
        totalEstablishments,
        totalActivities,
        recentActivities,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
}; 