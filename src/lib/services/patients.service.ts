import { api } from '@/lib/api';

export interface DossierMedical {
  dossierID: string;
  etatDossier: string;
  dateCreation: string;
}

export interface ConsultationMedicale {
  consultationID: string;
  dateConsultation: string;
  motif: string;
  medecin?: {
    nom: string;
    prenom: string;
  };
}

export interface ExamenMedical {
  examenID: string;
  dateExamen: string;
  resultat?: string;
  typeExamen?: {
    nomType: string;
  };
}

export interface Patient {
  patientID: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  dateNaissance?: string;
  groupeSanguin?: string;
  genre?: string;
  dossierMedical?: DossierMedical;
  consultations?: ConsultationMedicale[];
  examens?: ExamenMedical[];
}

export interface CreatePatientDto {
  nom: string;
  prenom: string;
  dateNaissance: string;
  genre: 'M' | 'F';
  adresse: string;
  telephone: string;
  email: string;
  groupeSanguin: string;
  createdBy: string;
  dossierMedical?: {
    etatDossier: 'ACTIF' | 'INACTIF' | 'ARCHIVE';
  };
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    const res = await api.get('/patients');
    return res.data;
  },
  async create(data: CreatePatientDto): Promise<Patient> {
    const res = await api.post('/patients', data);
    return res.data;
  },
  async getById(id: string): Promise<Patient> {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },
  // Ajouter d'autres méthodes si besoin (update, remove)
}; 