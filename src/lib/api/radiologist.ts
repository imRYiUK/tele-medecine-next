import { api } from '../api';

// Types basés sur le schéma Prisma
export interface ExamenMedical {
  examenID: string;
  dossierID: string;
  patientID: string;
  typeExamenID: string;
  demandeParID: string;
  dateExamen: string;
  description: string;
  resultat?: string;
  estAnalyse: boolean;
  consultationID?: string;
  patient: Patient;
  typeExamen: TypeExamen;
  demandePar: Utilisateur;
  images: ImageMedicale[];
  radiologues: Utilisateur[];
}

export interface Patient {
  patientID: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  genre: string;
  adresse: string;
  telephone: string;
  email?: string;
  groupeSanguin: string;
}

export interface TypeExamen {
  typeExamenID: string;
  nomType: string;
  description: string;
  categorie: string;
}

export interface Utilisateur {
  utilisateurID: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  telephone: string;
  role: string;
  etablissementID?: string;
  estActif: boolean;
}

export interface ImageMedicale {
  imageID: string;
  examenID: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  sopInstanceUID: string;
  dateAcquisition: string;
  modalite: string;
  description: string;
}

export interface ImageCollaboration {
  id: string;
  imageID: string;
  inviterID: string;
  inviteeID: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  image: ImageMedicale & {
    examen: ExamenMedical;
  };
  invitee: Utilisateur;
  inviter: Utilisateur;
}

export interface ChatMessage {
  messageID: string;
  imageID: string;
  senderID: string;
  content: string;
  timestamp: string;
  sender: Utilisateur;
  image: ImageMedicale & {
    examen: ExamenMedical;
  };
}

export interface RadiologistStats {
  examensEnAttente: number;
  examensEnCours: number;
  examensTermines: number;
  examensUrgents: number;
}

// API Service pour les radiologues
export const radiologistApi = {
  // Dashboard
  getStats: (): Promise<RadiologistStats> => 
    api.get('/examens-medicaux/radiologue/statistiques').then((res: any) => res.data),

  getRecentExams: (): Promise<ExamenMedical[]> => 
    api.get('/examens-medicaux/radiologue/examens-recents').then((res: any) => res.data),

  // Examens
  getExamens: (params?: { status?: string; category?: string; search?: string }): Promise<ExamenMedical[]> => 
    api.get('/examens-medicaux', { params }).then((res: any) => res.data),

  getRadiologistExamens: (params?: { status?: string; category?: string; search?: string }): Promise<ExamenMedical[]> => 
    api.get('/examens-medicaux/radiologue/liste-avec-images', { params }).then((res: any) => res.data),

  getExamen: (id: string): Promise<ExamenMedical> => 
    api.get(`/examens-medicaux/${id}`).then((res: any) => res.data),

  canEditExam: (examenID: string): Promise<boolean> => 
    api.get(`/examens-medicaux/${examenID}/can-edit`).then((res: any) => res.data),

  markAsAnalyzed: (examenID: string, resultat: string): Promise<ExamenMedical> => 
    api.put(`/examens-medicaux/${examenID}/marquer-analyse`, { resultat }).then((res: any) => res.data),

  inviteRadiologue: (examenID: string, radiologueID: string): Promise<any> => 
    api.put(`/examens-medicaux/${examenID}/invite-radiologue/${radiologueID}`).then((res: any) => res.data),

  // Collaborations
  getUserCollaborations: (): Promise<ImageCollaboration[]> => 
    api.get('/examen-medical/images/user/active-collaborations').then((res: any) => res.data),

  // User-centric endpoints (all images)
  getReceivedInvitations: (): Promise<ImageCollaboration[]> => 
    api.get('/examen-medical/images/user/received-invitations').then((res: any) => res.data),

  getReceivedRejectedInvitations: (): Promise<ImageCollaboration[]> => 
    api.get('/examen-medical/images/user/received-rejected-invitations').then((res: any) => res.data),

  getSentInvitations: (): Promise<ImageCollaboration[]> => 
    api.get('/examen-medical/images/user/sent-invitations').then((res: any) => res.data),

  getAllSentInvitations: (): Promise<ImageCollaboration[]> => 
    api.get('/examen-medical/images/user/all-sent-invitations').then((res: any) => res.data),

  getActiveCollaborations: (): Promise<ImageCollaboration[]> => 
    api.get('/examen-medical/images/user/active-collaborations').then((res: any) => res.data),

  // Legacy endpoints (keeping for backward compatibility)
  getPendingCollaborations: (): Promise<ImageCollaboration[]> => 
    api.get('/examen-medical/images/user/pending-collaborations').then((res: any) => res.data),

  inviteToImage: (imageID: string, inviteeID: string): Promise<any> => 
    api.post(`/examen-medical/images/${imageID}/invite`, { inviteeID }).then((res: any) => res.data),

  inviteToImageBySopInstanceUID: (sopInstanceUID: string, inviteeID: string): Promise<any> => 
    api.post(`/examen-medical/images/sop/${sopInstanceUID}/invite`, { inviteeID }).then((res: any) => res.data),

  getImageCollaborators: (imageID: string): Promise<Utilisateur[]> => 
    api.get(`/examen-medical/images/${imageID}/collaborators`).then((res: any) => res.data),

  getImageCollaboratorsBySopInstanceUID: (sopInstanceUID: string): Promise<Utilisateur[]> => 
    api.get(`/examen-medical/images/sop/${sopInstanceUID}/collaborators`).then((res: any) => res.data),

  getPendingCollaborationsForImage: (imageID: string): Promise<any[]> => 
    api.get(`/examen-medical/images/${imageID}/pending-collaborations`).then((res: any) => res.data),

  getPendingCollaborationsForImageBySopInstanceUID: (sopInstanceUID: string): Promise<any[]> => 
    api.get(`/examen-medical/images/sop/${sopInstanceUID}/pending-collaborations`).then((res: any) => res.data),

  // Messages
  getImageMessages: (imageID: string): Promise<ChatMessage[]> => 
    api.get(`/examen-medical/images/${imageID}/messages`).then((res: any) => res.data),

  sendMessage: (imageID: string, content: string): Promise<ChatMessage> => 
    api.post(`/examen-medical/images/${imageID}/messages`, { content }).then((res: any) => res.data),

  // Création d'examen
  createExamen: (data: {
    dossierID: string;
    patientID: string;
    typeExamenID: string;
    dateExamen: Date;
    description: string;
  }): Promise<ExamenMedical> => 
    api.post('/examens-medicaux', data).then((res: any) => res.data),

  // Patients
  getPatients: (): Promise<Patient[]> => 
    api.get('/patients').then((res: any) => res.data),

  // Types d'examens
  getTypeExamens: (): Promise<TypeExamen[]> => 
    api.get('/examens-medicaux/types').then((res: any) => res.data),

  // Utilisateurs
  getRadiologues: (): Promise<Utilisateur[]> => 
    api.get('/users').then((res: any) => res.data.filter((user: Utilisateur) => user.role === 'RADIOLOGUE' && user.estActif)),

  getProfile: (): Promise<Utilisateur> => 
    api.get('/users/profile/me').then((res: any) => res.data),

  updateProfile: (data: Partial<Utilisateur>): Promise<Utilisateur> => 
    api.put('/users/profile/me', data).then((res: any) => res.data),
}; 