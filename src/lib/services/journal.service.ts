import { api } from '@/lib/api';

export interface JournalEntry {
  journalActiviteID: string;
  typeAction: string;
  description: string;
  dateAction: string;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

export const journalService = {
  async getAll(): Promise<JournalEntry[]> {
    const res = await api.get('/journal');
    return res.data;
  },
}; 