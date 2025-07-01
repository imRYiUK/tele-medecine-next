import React from 'react';
import { Card } from "@/components/ui/card";
import { FolderOpen, X, MapPin, User } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Avantages de Notre Plateforme</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Notre solution innovante transforme le système de santé sénégalais en améliorant l'accès aux soins à travers une plateforme numérique intégrée.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="text-2xl text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dossier Médical Partagé</h3>
            <p className="text-gray-600">Accès sécurisé aux dossiers médicaux des patients depuis n'importe quel établissement de santé du pays.</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-2xl text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Gestion DICOM via Orthanc</h3>
            <p className="text-gray-600">Stockage et partage sécurisés des images médicales au format DICOM pour une meilleure prise en charge.</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-2xl text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Couverture Nationale</h3>
            <p className="text-gray-600">Accès aux soins spécialisés même dans les zones rurales et éloignées du Sénégal.</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-2xl text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Suivi Patient Optimisé</h3>
            <p className="text-gray-600">Continuité des soins assurée grâce à un suivi médical coordonné entre les différents professionnels de santé.</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 