import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from 'lucide-react';

const ServicesSection = () => {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalités Principales</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Notre plateforme offre un ensemble complet d'outils pour améliorer la prise en charge des patients à travers tout le Sénégal.
          </p>
        </div>
        
        <Tabs defaultValue="teleconsultation" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="teleconsultation" className="cursor-pointer whitespace-nowrap">Téléconsultation</TabsTrigger>
            <TabsTrigger value="teleradiologie" className="cursor-pointer whitespace-nowrap">Téléradiologie</TabsTrigger>
            <TabsTrigger value="dossier" className="cursor-pointer whitespace-nowrap">Dossier Médical</TabsTrigger>
            <TabsTrigger value="notification" className="cursor-pointer whitespace-nowrap">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teleconsultation" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-green-800">Consultations Médicales à Distance</h3>
                <p className="text-gray-600 mb-6">
                  Permettez aux patients de consulter des médecins spécialistes sans avoir à se déplacer. Notre système de téléconsultation offre une expérience fluide avec vidéo HD, partage de documents et prise de notes.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Consultations vidéo en haute définition</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Partage sécurisé de documents médicaux</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Prise de rendez-vous simplifiée</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Accès aux spécialistes dans tout le pays</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/images/teleconsultation.jpg" 
                  alt="Téléconsultation médicale" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="teleradiologie" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/images/teleradiologie.jpg" 
                  alt="Téléradiologie" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold mb-4 text-green-800">Gestion Avancée des Images Médicales</h3>
                <p className="text-gray-600 mb-6">
                  Notre système basé sur Orthanc permet le stockage, le partage et l'analyse des images DICOM. Les radiologues peuvent interpréter les examens à distance et partager leurs conclusions rapidement.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Stockage sécurisé des images DICOM</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Visualisation avancée des examens</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Interprétation à distance par des spécialistes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Partage sécurisé entre établissements</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dossier" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-green-800">Dossier Médical Partagé National</h3>
                <p className="text-gray-600 mb-6">
                  Un dossier médical électronique accessible dans tous les établissements de santé du Sénégal. Fini les dossiers perdus ou incomplets, toutes les informations sont centralisées et sécurisées.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Historique médical complet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Accès sécurisé pour les professionnels autorisés</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Tracabilité des consultations et traitements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Interopérabilité avec les systèmes existants</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/images/dossiermedicalpartage.jpg" 
                  alt="Dossier médical partagé" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notification" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/images/teleconsultation.jpg" 
                  alt="Système de notification" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold mb-4 text-green-800">Système de Notification Intelligent</h3>
                <p className="text-gray-600 mb-6">
                  Restez informé des événements importants grâce à notre système de notification. Les professionnels de santé sont alertés des nouveaux résultats, rendez-vous ou demandes d'avis.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Alertes en temps réel</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Notifications personnalisables</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Suivi des demandes d'avis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 w-4 h-4" />
                    <span>Rappels de rendez-vous pour les patients</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ServicesSection; 