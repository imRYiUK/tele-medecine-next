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

interface Collaboration {
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
  invitee: {
    nom: string;
    prenom: string;
  };
  status: string;
  createdAt: string;
}

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

export default function RadiologueCollaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [pendingCollaborations, setPendingCollaborations] = useState<PendingCollaboration[]>([]);
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  useEffect(() => {
    fetchCollaborations();
    fetchPendingCollaborations();
  }, []);

  useEffect(() => {
    if (selectedCollaboration) {
      fetchMessages(selectedCollaboration.imageId);
    }
  }, [selectedCollaboration]);

  const fetchCollaborations = async () => {
    try {
      const response = await api.get('/examen-medical/images/user/collaborations');
      setCollaborations(response.data);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    }
  };

  const fetchPendingCollaborations = async () => {
    try {
      const response = await api.get('/examen-medical/images/user/pending-collaborations');
      setPendingCollaborations(response.data);
    } catch (error) {
      console.error('Error fetching pending collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (imageId: string) => {
    try {
      const response = await api.get(`/examen-medical/images/${imageId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedCollaboration || !newMessage.trim()) return;

    try {
      const response = await api.post(`/examen-medical/images/${selectedCollaboration.imageId}/messages`, {
        content: newMessage,
      });

      if (response.data) {
        setNewMessage("");
        fetchMessages(selectedCollaboration.imageId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const acceptCollaboration = async (collaborationId: string) => {
    try {
      const response = await api.put(`/examen-medical/images/${collaborationId}/accept`);

      if (response.data) {
        fetchPendingCollaborations();
        fetchCollaborations();
      }
    } catch (error) {
      console.error('Error accepting collaboration:', error);
    }
  };

  const rejectCollaboration = async (collaborationId: string) => {
    try {
      const response = await api.put(`/examen-medical/images/${collaborationId}/reject`);

      if (response.data) {
        fetchPendingCollaborations();
      }
    } catch (error) {
      console.error('Error rejecting collaboration:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <p className="text-gray-600">Gestion des collaborations sur les images médicales</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Collaborations actives ({collaborations.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          En attente ({pendingCollaborations.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collaborations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {activeTab === 'active' ? (
                <>
                  <Users className="mr-2 h-5 w-5" />
                  Collaborations actives
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-5 w-5" />
                  Collaborations en attente
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeTab === 'active' ? (
                collaborations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune collaboration active</p>
                  </div>
                ) : (
                  collaborations.map((collaboration) => (
                    <div
                      key={collaboration.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedCollaboration?.id === collaboration.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCollaboration(collaboration)}
                    >
                      <div className="flex items-start space-x-3">
                        <ImageIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {collaboration.image.examenMedical.patient.prenom} {collaboration.image.examenMedical.patient.nom}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {collaboration.image.examenMedical.typeExamen.nom}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Avec {collaboration.inviter.prenom} {collaboration.inviter.nom}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {collaboration.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                pendingCollaborations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune invitation en attente</p>
                  </div>
                ) : (
                  pendingCollaborations.map((collaboration) => (
                    <div
                      key={collaboration.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <ImageIcon className="h-8 w-8 text-orange-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {collaboration.image.examenMedical.patient.prenom} {collaboration.image.examenMedical.patient.nom}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {collaboration.image.examenMedical.typeExamen.nom}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Invitation de {collaboration.inviter.prenom} {collaboration.inviter.nom}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              En attente
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => acceptCollaboration(collaboration.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectCollaboration(collaboration.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCollaboration ? (
                <div className="flex items-center justify-between">
                  <span>Messages</span>
                  <Link href={`/radiologue/examens/images/${selectedCollaboration.imageId}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir l'image
                    </Button>
                  </Link>
                </div>
              ) : (
                "Messages"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCollaboration ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez une collaboration pour voir les messages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {message.sender.prenom[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender.prenom} {message.sender.nom}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 