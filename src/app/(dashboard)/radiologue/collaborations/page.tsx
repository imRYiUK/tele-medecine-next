"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  UserPlus, 
  Users, 
  Image as ImageIcon,
  Send,
  Clock,
  CheckCircle,
  X,
  Eye,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { radiologistApi, ImageCollaboration } from "@/lib/api/radiologist";

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    nom: string;
    prenom: string;
  };
  createdAt: string;
}

interface PendingCollaboration {
  id: string;
  imageId: string;
  image: {
    url: string;
    description: string;
    examenMedical: {
      patient: {
        nom: string;
        prenom: string;
      };
      typeExamen: {
        nom: string;
      };
    };
  };
  inviter: {
    nom: string;
    prenom: string;
  };
  createdAt: string;
}

export default function CollaborationsPage() {
  const [pendingCollaborations, setPendingCollaborations] = useState<ImageCollaboration[]>([]);
  const [acceptedCollaborations, setAcceptedCollaborations] = useState<ImageCollaboration[]>([]);
  const [sentInvitations, setSentInvitations] = useState<ImageCollaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'sent'>('pending');
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchCurrentUser();
    loadCollaborations();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/profile/me');
      setCurrentUserId(response.data?.utilisateurID || '');
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const loadCollaborations = async () => {
    try {
      setLoading(true);
      
      // Load pending collaborations (received invitations)
      const pendingResponse = await radiologistApi.getReceivedInvitations();
      setPendingCollaborations(pendingResponse || []);
      
      // Load accepted collaborations
      const acceptedResponse = await radiologistApi.getActiveCollaborations();
      setAcceptedCollaborations(acceptedResponse || []);
      
      // Load sent invitations
      const sentResponse = await radiologistApi.getSentInvitations();
      setSentInvitations(sentResponse || []);
      
    } catch (error) {
      console.error('Error loading collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptCollaboration = async (collaborationId: string) => {
    try {
      setIsAccepting(collaborationId);
      await api.post(`/examen-medical/images/collaborations/${collaborationId}/accept`);
      await loadCollaborations();
    } catch (error) {
      console.error('Error accepting collaboration:', error);
    } finally {
      setIsAccepting(null);
    }
  };

  const rejectCollaboration = async (collaborationId: string) => {
    try {
      setIsRejecting(collaborationId);
      await api.post(`/examen-medical/images/collaborations/${collaborationId}/reject`);
      await loadCollaborations();
    } catch (error) {
      console.error('Error rejecting collaboration:', error);
    } finally {
      setIsRejecting(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">En attente</Badge>;
      case 'ACCEPTED':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Acceptée</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejetée</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Expirée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Collaborations</h1>
        <p className="text-gray-600">Gérez vos invitations et collaborations DICOM</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
        >
          <Clock className="mr-2 h-4 w-4" />
          En attente ({pendingCollaborations.length})
        </Button>
        <Button
          variant={activeTab === 'accepted' ? 'default' : 'outline'}
          onClick={() => setActiveTab('accepted')}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Acceptées ({acceptedCollaborations.length})
        </Button>
        <Button
          variant={activeTab === 'sent' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sent')}
        >
          <Users className="mr-2 h-4 w-4" />
          Envoyées ({sentInvitations.length})
        </Button>
      </div>

      {/* Pending Collaborations */}
      {activeTab === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations en attente</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCollaborations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Aucune invitation en attente</p>
                <p className="text-sm">Vous n'avez pas d'invitations de collaboration en attente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCollaborations.map((collaboration) => (
                  <div
                    key={collaboration.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-medium">
                            {collaboration.inviter.prenom[0]}{collaboration.inviter.nom[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {collaboration.inviter.prenom} {collaboration.inviter.nom}
                          </div>
                          <div className="text-sm text-gray-500">{collaboration.inviter.email}</div>
                        </div>
                      </div>
                      {getStatusBadge(collaboration.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Patient:</strong> {collaboration.image.examen.patient.prenom} {collaboration.image.examen.patient.nom}</p>
                      <p><strong>Examen:</strong> {collaboration.image.examen.typeExamen.nomType}</p>
                      <p><strong>Description:</strong> {collaboration.image.description}</p>
                      <p><strong>Invitation envoyée le:</strong> {formatTimestamp(collaboration.createdAt)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link href={`/radiologue/dicom/image/${collaboration.image.sopInstanceUID}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir l'image
                        </Button>
                      </Link>
                      
                      {collaboration.inviteeID === currentUserId && (
                        <>
                          <Button
                            onClick={() => acceptCollaboration(collaboration.id)}
                            disabled={isAccepting === collaboration.id}
                            size="sm"
                          >
                            {isAccepting === collaboration.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Accepter
                          </Button>
                          <Button
                            onClick={() => rejectCollaboration(collaboration.id)}
                            disabled={isRejecting === collaboration.id}
                            variant="outline"
                            size="sm"
                          >
                            {isRejecting === collaboration.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Accepted Collaborations */}
      {activeTab === 'accepted' && (
        <Card>
          <CardHeader>
            <CardTitle>Collaborations acceptées</CardTitle>
          </CardHeader>
          <CardContent>
            {acceptedCollaborations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Aucune collaboration acceptée</p>
                <p className="text-sm">Vous n'avez pas encore de collaborations actives</p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedCollaborations.map((collaboration) => (
                  <div
                    key={collaboration.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {collaboration.inviter.prenom[0]}{collaboration.inviter.nom[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {collaboration.inviter.prenom} {collaboration.inviter.nom}
                          </div>
                          <div className="text-sm text-gray-500">{collaboration.inviter.email}</div>
                        </div>
                      </div>
                      {getStatusBadge(collaboration.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Patient:</strong> {collaboration.image.examen.patient.prenom} {collaboration.image.examen.patient.nom}</p>
                      <p><strong>Examen:</strong> {collaboration.image.examen.typeExamen.nomType}</p>
                      <p><strong>Description:</strong> {collaboration.image.description}</p>
                      <p><strong>Collaboration acceptée le:</strong> {formatTimestamp(collaboration.updatedAt || collaboration.createdAt)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link href={`/radiologue/dicom/image/${collaboration.image.sopInstanceUID}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir l'image
                        </Button>
                      </Link>
                      <Link href={`/radiologue/dicom/image/${collaboration.image.sopInstanceUID}`}>
                        <Button size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sent Invitations */}
      {activeTab === 'sent' && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations envoyées</CardTitle>
          </CardHeader>
          <CardContent>
            {sentInvitations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Aucune invitation envoyée</p>
                <p className="text-sm">Vous n'avez pas encore envoyé d'invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentInvitations.map((collaboration) => (
                  <div
                    key={collaboration.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {collaboration.invitee.prenom[0]}{collaboration.invitee.nom[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {collaboration.invitee.prenom} {collaboration.invitee.nom}
                          </div>
                          <div className="text-sm text-gray-500">{collaboration.invitee.email}</div>
                        </div>
                      </div>
                      {getStatusBadge(collaboration.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Patient:</strong> {collaboration.image.examen.patient.prenom} {collaboration.image.examen.patient.nom}</p>
                      <p><strong>Examen:</strong> {collaboration.image.examen.typeExamen.nomType}</p>
                      <p><strong>Description:</strong> {collaboration.image.description}</p>
                      <p><strong>Invitation envoyée le:</strong> {formatTimestamp(collaboration.createdAt)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link href={`/radiologue/dicom/image/${collaboration.image.sopInstanceUID}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir l'image
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 