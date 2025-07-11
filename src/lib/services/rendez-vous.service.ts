import { api } from '@/lib/api';

export interface RendezVous {
  rendezVousID: string;
  dateHeure?: string;
  date?: string;
  debutTime?: string;
  endTime?: string;
  motif: string;
  patient?: {
    patientID: string;
    nom: string;
    prenom: string;
  };
  medecin?: {
    utilisateurID: string;
    nom: string;
    prenom: string;
  };
  // Ajouter d'autres champs si besoin
}

export interface CreateRendezVousDto {
  patientID: string;
  medecinID: string;
  date: string;
  debutTime: string;
  endTime: string;
  motif: string;
}

export const rendezVousService = {
  async getAll(): Promise<RendezVous[]> {
    const res = await api.get('/rendez-vous');
    return res.data;
  },
  async create(data: CreateRendezVousDto): Promise<RendezVous> {
    const res = await api.post('/rendez-vous', data);
    return res.data;
  },
  async update(id: string, data: Partial<{ date: string; debutTime: string; endTime: string; motif: string; medecinID: string }>): Promise<RendezVous> {
    const res = await api.put(`/rendez-vous/${id}`, data);
    return res.data;
  },
  async getByMedecin(medecinID: string): Promise<RendezVous[]> {
    const res = await api.get(`/rendez-vous/medecin/${medecinID}`);
    return res.data;
  },
  async getByRadiologue(radiologueID: string): Promise<RendezVous[]> {
    const res = await api.get(`/rendez-vous/radiologue/${radiologueID}`);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/rendez-vous/${id}`);
  },
  // Ajouter d'autres méthodes si besoin (getById, update, remove)
}; 