import { api } from '@/lib/api';

export interface Etablissement {
  etablissementID: string;
  nom: string;
  type: string;
  region: string;
  adresse: string;
  telephone: string;
  email: string;
  estActif: boolean;
  description?: string;
  siteWeb?: string;
  createdAt: string;
  updatedAt: string;
  utilisateursCount?: number;
  orthancUrl?: string;
  orthancLogin?: string;
  orthancPassword?: string;
}

export interface CreateEtablissementDto {
  nom: string;
  type: string;
  region: string;
  adresse: string;
  telephone: string;
  email: string;
  description?: string;
  siteWeb?: string;
  estActif?: boolean;
  orthancUrl?: string;
  orthancLogin?: string;
  orthancPassword?: string;
}

export interface UpdateEtablissementDto {
  nom?: string;
  type?: string;
  region?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  description?: string;
  siteWeb?: string;
  estActif?: boolean;
  orthancUrl?: string;
  orthancLogin?: string;
  orthancPassword?: string;
}

export const etablissementsService = {
  async getAll(): Promise<Etablissement[]> {
    const res = await api.get('/etablissements');
    return res.data;
  },
  async getById(id: string): Promise<Etablissement> {
    const res = await api.get(`/etablissements/${id}`);
    return res.data;
  },
  async create(data: CreateEtablissementDto): Promise<Etablissement> {
    const res = await api.post('/etablissements', data);
    return res.data;
  },
  async update(id: string, data: UpdateEtablissementDto): Promise<Etablissement> {
    const res = await api.put(`/etablissements/${id}`, data);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/etablissements/${id}`);
  },
}; 