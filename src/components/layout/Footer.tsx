import React from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Stethoscope } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">

              <Stethoscope className="h-4 w-4 text-white" />
              <span className="text-xl font-bold">Sunu Santé</span>
            </div>
            <p className="text-gray-400 mb-4">
              Plateforme nationale de télémédecine et téléradiologie pour améliorer l'accès aux soins au Sénégal.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <span className="sr-only">Facebook</span>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <span className="sr-only">Twitter</span>
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <span className="sr-only">Instagram</span>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Accueil</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Services</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Fonctionnalités</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors cursor-pointer">À propos</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Téléconsultation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Téléradiologie</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Dossier Médical Partagé</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Formation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Support Technique</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">
              Inscrivez-vous pour recevoir les dernières nouvelles et mises à jour.
            </p>
            <div className="flex">
              <Input 
                placeholder="Votre email" 
                className="rounded-r-none border-gray-700 bg-gray-800 text-white"
              />
              <Button className="rounded-l-none bg-green-600 hover:bg-green-700 cursor-pointer">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Sunu Santé. Tous droits réservés.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-white transition-colors cursor-pointer">Mentions légales</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">Politique de confidentialité</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">Conditions d'utilisation</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 