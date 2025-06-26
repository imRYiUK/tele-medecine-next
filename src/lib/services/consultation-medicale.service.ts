import { api } from '@/lib/api';

export interface PrescriptionDto {
  medicamentID: string;
  posologie: string;
  duree: string;
  instructions: string;
}

export interface OrdonnanceDto {
  prescriptions: PrescriptionDto[];
}

export interface ConsultationMedicale {
  consultationID: string;
  dossierID: string;
  medecinID: string;
  dateConsultation: string;
  motif: string;
  diagnostics: string;
  observations: string;
  traitementPrescrit: string;
  estTelemedicine: boolean;
  lienVisio?: string;
  createdAt: string;
  updatedAt: string;
  dossier?: {
    dossierID: string;
    patientID: string;
    dateCreation: string;
    etatDossier: string;
    createdBy: string;
    createdAt: string;
    patient: {
      nom: string;
      prenom: string;
      dateNaissance: string;
    };
  };
  medecin?: {
    nom: string;
    prenom: string;
    role: string;
  };
  ordonnances?: Array<{
    ordonnanceID: string;
    consultationID: string;
    dateEmission: string;
    dateExpiration: string;
    estRenouvelable: boolean;
    prescriptions: Array<{
      prescriptionID: string;
      ordonnanceID: string;
      medicamentID: string;
      posologie: string;
      duree: string;
      instructions: string;
      medicament: {
        medicamentID: string;
        nom: string;
      };
    }>;
  }>;
  ordonnance?: OrdonnanceDto;
  patient?: {
    patientID: string;
    nom: string;
    prenom: string;
  };
}

export interface CreateConsultationMedicaleDto {
  dossierID: string;
  medecinID: string;
  dateConsultation: string;
  motif: string;
  diagnostics: string;
  observations: string;
  traitementPrescrit: string;
  estTelemedicine?: boolean;
  lienVisio?: string;
  ordonnance?: OrdonnanceDto;
}

export interface UpdateConsultationMedicaleDto {
  motif?: string;
  diagnostics?: string;
  observations?: string;
  traitementPrescrit?: string;
  estTelemedicine?: boolean;
  lienVisio?: string;
  ordonnance?: OrdonnanceDto;
}

export const consultationMedicaleService = {
  async getAll(): Promise<ConsultationMedicale[]> {
    const res = await api.get('/consultations');
    return res.data;
  },
  async getByMedecin(medecinID: string): Promise<ConsultationMedicale[]> {
    const res = await api.get(`/consultations/medecin/${medecinID}`);
    return res.data;
  },
  async getByPatient(patientID: string): Promise<ConsultationMedicale[]> {
    const res = await api.get(`/consultations/patient/${patientID}`);
    return res.data;
  },
  async create(data: CreateConsultationMedicaleDto): Promise<ConsultationMedicale> {
    const res = await api.post('/consultations', data);
    return res.data;
  },
  async update(id: string, data: UpdateConsultationMedicaleDto): Promise<ConsultationMedicale> {
    const res = await api.patch(`/consultations/${id}`, data);
    return res.data;
  },
}; 