import { api } from '@/lib/api';

export interface MedicamentDto {
  medicamentID: string;
  nom: string;
}

export const medicamentsService = {
  async getAll(): Promise<MedicamentDto[]> {
    const res = await api.get('/medicaments');
    return res.data;
  },
  async searchByName(term: string): Promise<MedicamentDto[]> {
    const res = await api.get(`/medicaments/search?q=${encodeURIComponent(term)}`);
    return res.data;
  },
  async autocomplete(term: string): Promise<MedicamentDto[]> {
    const res = await api.get(`/medicaments/autocomplete?q=${encodeURIComponent(term)}`);
    return res.data;
  },
  async getById(id: string): Promise<MedicamentDto> {
    const res = await api.get(`/medicaments/${id}`);
    return res.data;
  },
}; 