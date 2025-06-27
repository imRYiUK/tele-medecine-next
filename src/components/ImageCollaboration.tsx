"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Send, 
  X,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface Collaborator {
  utilisateurID: string;
  nom: string;
  prenom: string;
  email: string;
}

interface ChatMessage {
  messageID: string;
  content: string;
  timestamp: string;
  sender: {
    utilisateurID: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

interface Collaboration {
  id: string;
  imageID: string;
  inviterID: string;
  inviteeID: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  inviter: {
    utilisateurID: string;
    nom: string;
    prenom: string;
    email: string;
  };
  invitee: {
    utilisateurID: string;
    nom: string;
    prenom: string;
    email: string;
  };
  image: {
    imageID: string;
    description: string;
    examen: {
      examenID: string;
      patient: {
        nom: string;
        prenom: string;
      };
      typeExamen: {
        nomType: string;
      };
    };
  };
}

interface ImageCollaborationProps {
  imageId: string;
  currentUserId: string;
}

export default function ImageCollaboration({ imageId, currentUserId }: ImageCollaborationProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'collaborators' | 'invite' | 'pending'>('chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCollaborations, setPendingCollaborations] = useState<Collaboration[]>([]);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageId) {
      loadCollaborators();
      loadMessages();
      loadPendingCollaborations();
    }
  }, [imageId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadCollaborators = async () => {
    try {
      const response = await api.get(`/examen-medical/images/${imageId}/collaborators`);
      setCollaborators(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setError('Failed to load collaborators');
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.get(`/examen-medical/images/${imageId}/messages`);
      setMessages(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCollaborations = async () => {
    try {
      const response = await api.get('/examen-medical/images/user/pending-collaborations');
      const pending = response.data?.data || response.data || [];
      // Filter for current image
      const imagePending = pending.filter((collab: Collaboration) => collab.imageID === imageId);
      setPendingCollaborations(imagePending);
    } catch (error) {
      console.error('Error loading pending collaborations:', error);
    }
  };

  const acceptCollaboration = async (collaborationId: string) => {
    try {
      setIsAccepting(collaborationId);
      await api.post(`/examen-medical/images/collaborations/${collaborationId}/accept`);
      await loadCollaborators();
      await loadPendingCollaborations();
      setActiveTab('collaborators');
    } catch (error) {
      console.error('Error accepting collaboration:', error);
      setError('Failed to accept collaboration');
    } finally {
      setIsAccepting(null);
    }
  };

  const rejectCollaboration = async (collaborationId: string) => {
    try {
      setIsRejecting(collaborationId);
      await api.post(`/examen-medical/images/collaborations/${collaborationId}/reject`);
      await loadPendingCollaborations();
    } catch (error) {
      console.error('Error rejecting collaboration:', error);
      setError('Failed to reject collaboration');
    } finally {
      setIsRejecting(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const response = await api.post(`/examen-medical/images/${imageId}/messages`, {
        content: newMessage.trim()
      });

      const sentMessage = response.data?.data || response.data;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const inviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      // First, we need to find the user by email
      const userResponse = await api.get(`/utilisateurs/search?email=${inviteEmail.trim()}`);
      const user = userResponse.data?.data || userResponse.data;
      
      if (!user) {
        setError('User not found with this email');
        return;
      }

      // Then invite them to collaborate
      await api.post(`/examen-medical/images/${imageId}/invite`, {
        inviteeID: user.utilisateurID
      });

      setInviteEmail("");
      await loadPendingCollaborations();
      setActiveTab('pending');
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      setError('Failed to invite collaborator');
    } finally {
      setIsInviting(false);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4">
        <Button
          variant={activeTab === 'chat' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat
        </Button>
        <Button
          variant={activeTab === 'collaborators' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('collaborators')}
        >
          <Users className="mr-2 h-4 w-4" />
          Collaborateurs ({collaborators.length})
        </Button>
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('pending')}
        >
          <Clock className="mr-2 h-4 w-4" />
          En attente ({pendingCollaborations.length})
        </Button>
        <Button
          variant={activeTab === 'invite' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('invite')}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Inviter
        </Button>
      </div>

      <div className="flex-1 space-y-4">
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-600 text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-1 min-h-0 overflow-y-auto border rounded-lg p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucun message pour le moment</p>
                  <p className="text-sm">Commencez la conversation !</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.messageID}
                    className={`flex ${message.sender.utilisateurID === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.sender.utilisateurID === currentUserId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {message.sender.prenom} {message.sender.nom}
                      </div>
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isSending}
              />
              <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Collaborators Tab */}
        {activeTab === 'collaborators' && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {collaborators.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aucun collaborateur pour le moment</p>
                <p className="text-sm">Invitez des radiologues à collaborer</p>
              </div>
            ) : (
              collaborators.map((collaborator) => (
                <div
                  key={collaborator.utilisateurID}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {collaborator.prenom[0]}{collaborator.nom[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {collaborator.prenom} {collaborator.nom}
                      </div>
                      <div className="text-sm text-gray-500">{collaborator.email}</div>
                    </div>
                  </div>
                  <Badge variant="outline">Collaborateur</Badge>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Collaborations Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingCollaborations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune invitation en attente</p>
                <p className="text-sm">Toutes les invitations ont été traitées</p>
              </div>
            ) : (
              pendingCollaborations.map((collaboration) => (
                <div
                  key={collaboration.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium text-sm">
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
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      En attente
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Patient: {collaboration.image.examen.patient.prenom} {collaboration.image.examen.patient.nom}</p>
                    <p>Examen: {collaboration.image.examen.typeExamen.nomType}</p>
                    <p>Invitation envoyée le: {formatTimestamp(collaboration.createdAt)}</p>
                  </div>

                  {collaboration.inviteeID === currentUserId && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => acceptCollaboration(collaboration.id)}
                        disabled={isAccepting === collaboration.id}
                        size="sm"
                        className="flex-1"
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
                        className="flex-1"
                      >
                        {isRejecting === collaboration.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Invite Tab */}
        {activeTab === 'invite' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Invitez un radiologue à collaborer sur cette image DICOM.</p>
              <p className="mt-2">Le collaborateur pourra :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Voir l'image DICOM</li>
                <li>Participer aux discussions</li>
                <li>Ajouter des annotations</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Email du radiologue</label>
                <Input
                  type="email"
                  placeholder="radiologue@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={inviteCollaborator}
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full"
              >
                {isInviting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Invitation en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Inviter le radiologue
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>L'invitation sera valide pendant 24 heures.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 