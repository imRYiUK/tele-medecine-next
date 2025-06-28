"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Send, 
  X,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import { radiologistApi } from "@/lib/api/radiologist";
import { useChatSocket } from "@/lib/hooks/useChatSocket";

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
  sopInstanceUID?: string;
  currentUserId: string;
}

export default function ImageCollaboration({ imageId, sopInstanceUID, currentUserId }: ImageCollaborationProps) {
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
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if there are multiple collaborators (more than just the current user)
  const hasMultipleCollaborators = collaborators.length > 1 || 
    (collaborators.length === 1 && collaborators[0].utilisateurID !== currentUserId);

  // WebSocket chat hook - only use when there are multiple collaborators
  const {
    isConnected,
    isJoining,
    sendMessage: sendSocketMessage,
    sendTypingIndicator,
  } = useChatSocket({
    imageID: imageId,
    onNewMessage: (message) => {
      setMessages(prev => [...prev, message]);
    },
    onUserTyping: (userId, isTyping) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    },
    onError: (error) => {
      setError(error);
    },
    // Only enable WebSocket if there are multiple collaborators
    enabled: hasMultipleCollaborators,
  });

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
      // Use the new SOP-based endpoint if sopInstanceUID is available, otherwise fall back to imageId
      if (sopInstanceUID) {
        const response = await radiologistApi.getImageCollaboratorsBySopInstanceUID(sopInstanceUID);
        setCollaborators(response || []);
      } else {
        const response = await api.get(`/examen-medical/images/${imageId}/collaborators`);
        setCollaborators(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
      toast.error("Erreur lors du chargement des collaborateurs");
      setError('Failed to load collaborators');
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.get(`/examen-medical/images/${imageId}/messages`);
      setMessages(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error("Erreur lors du chargement des messages");
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCollaborations = async () => {
    try {
      // Use the new SOP-based endpoint if sopInstanceUID is available, otherwise fall back to the old method
      if (sopInstanceUID) {
        const response = await radiologistApi.getPendingCollaborationsForImageBySopInstanceUID(sopInstanceUID);
        setPendingCollaborations(response || []);
      } else {
        // Use the imageId-based endpoint for pending collaborations where current user is the inviter
        const response = await radiologistApi.getPendingCollaborationsForImage(imageId);
        setPendingCollaborations(response || []);
      }
    } catch (error) {
      console.error('Error loading pending collaborations:', error);
      toast.error("Erreur lors du chargement des invitations en attente");
    }
  };

  const acceptCollaboration = async (collaborationId: string) => {
    try {
      setIsAccepting(collaborationId);
      await api.post(`/examen-medical/images/collaborations/${collaborationId}/accept`);
      toast.success("Collaboration acceptée avec succès");
      await loadCollaborators();
      await loadPendingCollaborations();
      setActiveTab('collaborators');
    } catch (error) {
      console.error('Error accepting collaboration:', error);
      toast.error("Erreur lors de l'acceptation de la collaboration");
      setError('Failed to accept collaboration');
    } finally {
      setIsAccepting(null);
    }
  };

  const rejectCollaboration = async (collaborationId: string) => {
    try {
      setIsRejecting(collaborationId);
      await api.post(`/examen-medical/images/collaborations/${collaborationId}/reject`);
      toast.success("Collaboration rejetée");
      await loadPendingCollaborations();
    } catch (error) {
      console.error('Error rejecting collaboration:', error);
      toast.error("Erreur lors du rejet de la collaboration");
      setError('Failed to reject collaboration');
    } finally {
      setIsRejecting(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      
      // If there are multiple collaborators, use WebSocket if connected, otherwise fallback to REST
      if (hasMultipleCollaborators && isConnected) {
        // Use WebSocket for real-time messaging
        await sendSocketMessage(newMessage.trim());
        setNewMessage("");
      } else {
        // Fallback to REST API if WebSocket is not connected or if single collaborator
        const response = await api.post(`/examen-medical/images/${imageId}/messages`, {
          content: newMessage.trim()
        });

        const sentMessage = response.data?.data || response.data;
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi du message");
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Send typing indicator only if there are multiple collaborators and WebSocket is connected
    if (hasMultipleCollaborators && isConnected) {
      sendTypingIndicator(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 1000);
    }
  };

  const inviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      // First, we need to find the user by email
      const userResponse = await api.get(`/users/search?q=${inviteEmail.trim()}`);
      const user = userResponse.data?.data || userResponse.data;
      
      if (!user) {
        toast.error("Utilisateur non trouvé avec cet email");
        setError('User not found with this email');
        return;
      }

      // Check if the user is a radiologist
      if (user.role !== 'RADIOLOGUE') {
        toast.error("Vous ne pouvez inviter que des radiologues à collaborer");
        setError('You can only invite radiologists to collaborate');
        return;
      }

      // Use the new SOP-based endpoint if sopInstanceUID is available, otherwise fall back to imageId
      if (sopInstanceUID) {
        await radiologistApi.inviteToImageBySopInstanceUID(sopInstanceUID, user.utilisateurID);
      } else {
        // Fallback to the old imageId-based endpoint
        await radiologistApi.inviteToImage(imageId, user.utilisateurID);
      }

      toast.success(`Invitation envoyée à ${user.prenom} ${user.nom}`);
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

  const getTypingIndicatorText = () => {
    if (typingUsers.size === 0) return null;
    
    const typingUserIds = Array.from(typingUsers);
    const typingCollaborators = collaborators.filter(c => 
      typingUserIds.includes(c.utilisateurID) && c.utilisateurID !== currentUserId
    );
    
    if (typingCollaborators.length === 0) return null;
    
    if (typingCollaborators.length === 1) {
      return `${typingCollaborators[0].prenom} ${typingCollaborators[0].nom} est en train d'écrire...`;
    } else if (typingCollaborators.length === 2) {
      return `${typingCollaborators[0].prenom} et ${typingCollaborators[1].prenom} sont en train d'écrire...`;
    } else {
      return 'Plusieurs personnes sont en train d\'écrire...';
    }
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
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-1">
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
        
        {/* Connection Status Indicator */}
        <div className="flex items-center space-x-2">
          {!hasMultipleCollaborators ? (
            <div className="flex items-center text-gray-500 text-sm">
              <WifiOff className="h-4 w-4 mr-1" />
              Mode solo
            </div>
          ) : isConnected ? (
            <div className="flex items-center text-green-600 text-sm">
              <Wifi className="h-4 w-4 mr-1" />
              Connecté
            </div>
          ) : (
            <div className="flex items-center text-red-600 text-sm">
              <WifiOff className="h-4 w-4 mr-1" />
              Déconnecté
            </div>
          )}
        </div>
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
            {!hasMultipleCollaborators && (
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-600 text-sm">
                  Mode solo activé - Invitez d'autres collaborateurs pour activer le chat en temps réel
                </span>
              </div>
            )}
            
            <div className="flex-1 min-h-0 max-h-96 overflow-y-auto border rounded-lg p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucun message pour le moment</p>
                  <p className="text-sm">Commencez la conversation !</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.messageID}
                      className={`flex ${
                        message.sender.utilisateurID === currentUserId
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.sender.utilisateurID === currentUserId
                            ? 'bg-blue-500 text-white'
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
                  ))}
                  
                  {/* Typing indicators */}
                  {Array.from(typingUsers).map((userId) => {
                    const typingUser = collaborators.find(c => c.utilisateurID === userId);
                    if (!typingUser || userId === currentUserId) return null;
                    
                    return (
                      <div key={userId} className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
                          <div className="text-xs opacity-75 mb-1">
                            {typingUser.prenom} {typingUser.nom}
                          </div>
                          <div className="text-sm italic">tape...</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder={hasMultipleCollaborators ? "Tapez votre message..." : "Mode solo - Invitez des collaborateurs pour discuter"}
                value={newMessage}
                onChange={handleMessageInput}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isSending || !hasMultipleCollaborators}
                className={!hasMultipleCollaborators ? "bg-gray-100" : ""}
              />
              <Button 
                onClick={sendMessage} 
                disabled={isSending || !newMessage.trim() || !hasMultipleCollaborators}
                className={!hasMultipleCollaborators ? "bg-gray-400 cursor-not-allowed" : ""}
              >
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
                <li>Participer aux discussions en temps réel</li>
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