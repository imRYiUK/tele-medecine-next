import { api } from '@/lib/api';

export interface User {
  utilisateurID: string;
  nom: string;
  prenom: string;
  email: string;
  username: string;
  telephone: string;
  role: 'SUPER_ADMIN' | 'ADMINISTRATEUR' | 'MEDECIN' | 'RADIOLOGUE' | 'RECEPTIONNISTE';
  estActif: boolean;
  etablissementID: string;
  etablissement?: {
    etablissementID: string;
    nom: string;
  };
}

export interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  username: string;
  telephone: string;
  role: string;
  password: string;
  etablissementID?: string;
}

export interface UpdateUserDto {
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  telephone?: string;
  role?: string;
  password?: string;
  estActif?: boolean;
  etablissementID?: string;
}

export interface ProfileUpdateDto {
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  telephone?: string;
  password?: string;
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const res = await api.get('/users');
    return res.data;
  },
  async getById(id: string): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  async create(data: CreateUserDto): Promise<User> {
    const res = await api.post('/users', data);
    return res.data;
  },
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
  async getMedecinsByEtablissement(etablissementID: string): Promise<User[]> {
    const res = await api.get(`/users/medecins/etablissement/${etablissementID}`);
    return res.data;
  },
  async getRadiologuesByEtablissement(etablissementID: string): Promise<User[]> {
    const res = await api.get(`/users/radiologues/etablissement/${etablissementID}`);
    return res.data;
  },
  // Profile methods
  async getProfile(): Promise<User> {
    const res = await api.get('/users/profile/me');
    return res.data;
  },
  async updateProfile(data: ProfileUpdateDto): Promise<User> {
    const res = await api.put('/users/profile/me', data);
    return res.data;
  },
}; 