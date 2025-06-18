export interface User {
  utilisateurID: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  telephone: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'NURSE' | 'PATIENT';
  etablissementID: string;
  estActif: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: User['role'];
}

export interface AuthResponse {
  user: User;
  token: string;
} 