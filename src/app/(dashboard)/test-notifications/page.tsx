"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notificationService } from '@/lib/services/notificationService';
import { useAuth } from '@/lib/hooks/useAuth';

export default function TestNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [titre, setTitre] = useState('');
  const [type, setType] = useState('system');
  const [destinataires, setDestinataires] = useState<string[]>([]);
  const { user } = useAuth();

  const createTestNotification = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      await notificationService.createTestNotification();
      setMessage('Notification de test créée avec succès !');
    } catch (error) {
      console.error('Error creating test notification:', error);
      setMessage('Erreur lors de la création de la notification de test.');
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomNotification = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      
      if (!titre.trim() || !message.trim()) {
        setMessage('Veuillez remplir le titre et le message.');
        return;
      }

      await notificationService.createNotification({
        destinataires: destinataires.length > 0 ? destinataires : [user?.utilisateurID || ''],
        titre: titre,
        message: message,
        type: type,
        lien: undefined,
      });
      setMessage('Notification personnalisée créée avec succès !');
      
      // Reset form
      setTitre('');
      setMessage('');
      setDestinataires([]);
      setType('system');
    } catch (error) {
      console.error('Error creating custom notification:', error);
      setMessage('Erreur lors de la création de la notification personnalisée.');
    } finally {
      setIsLoading(false);
    }
  };

  const addDestinataire = () => {
    const newDestinataire = prompt('Entrez l\'ID de l\'utilisateur destinataire:');
    if (newDestinataire && newDestinataire.trim()) {
      setDestinataires(prev => [...prev, newDestinataire.trim()]);
    }
  };

  const removeDestinataire = (index: number) => {
    setDestinataires(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test du système de notifications multi-destinataires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Cette page permet de tester le nouveau système de notifications multi-destinataires.
              Vous pouvez créer des notifications pour un ou plusieurs utilisateurs.
            </p>
            
            <div className="flex space-x-4">
              <Button 
                onClick={createTestNotification} 
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? 'Création...' : 'Créer une notification de test'}
              </Button>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('succès') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Créer une notification personnalisée</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="titre">Titre</Label>
                <Input
                  id="titre"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Titre de la notification"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message de la notification"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Système</SelectItem>
                    <SelectItem value="examen">Examen</SelectItem>
                    <SelectItem value="rendez-vous">Rendez-vous</SelectItem>
                    <SelectItem value="urgence">Urgence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Destinataires</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDestinataire}
                    >
                      Ajouter destinataire
                    </Button>
                    <span className="text-sm text-gray-500">
                      (Laissez vide pour envoyer à vous-même)
                    </span>
                  </div>
                  
                  {destinataires.length > 0 && (
                    <div className="space-y-1">
                      {destinataires.map((destinataire, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={destinataire}
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDestinataire(index)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={createCustomNotification} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Création...' : 'Créer la notification personnalisée'}
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Instructions de test :</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Cliquez sur "Créer une notification de test" pour tester le système de base</li>
              <li>Utilisez le formulaire ci-dessus pour créer des notifications personnalisées</li>
              <li>Ajoutez plusieurs destinataires pour tester les notifications multi-utilisateurs</li>
              <li>Vérifiez que les notifications apparaissent dans le widget de notifications</li>
              <li>Testez la lecture et suppression des notifications</li>
              <li>Vérifiez que les notifications arrivent en temps réel via WebSocket</li>
            </ol>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Informations de débogage :</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Utilisateur actuel :</strong> {user?.prenom} {user?.nom} ({user?.email})
              </p>
              <p className="text-sm text-gray-600">
                <strong>ID utilisateur :</strong> {user?.utilisateurID}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Rôle :</strong> {user?.role}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Destinataires sélectionnés :</strong> {destinataires.length > 0 ? destinataires.join(', ') : 'Aucun (envoi à vous-même)'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 