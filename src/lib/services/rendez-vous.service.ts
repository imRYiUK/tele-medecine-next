import { api } from '@/lib/api';

export interface RendezVous {
  rendezVousID: string;
  dateHeure: string;
  statut: string;
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

export const rendezVousService = {
  async getAll(): Promise<RendezVous[]> {
    const res = await api.get('/rendez-vous');
    return res.data;
  },
  // Ajouter d'autres méthodes si besoin (getById, create, update, remove)
}; 