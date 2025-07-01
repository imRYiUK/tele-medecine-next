import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';

const ContactSection = () => {
  return (
    <section id="contact" className="py-16 bg-gray-100">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
            <p className="text-lg text-gray-600 mb-8">
              Vous souhaitez en savoir plus sur notre plateforme ou rejoindre le réseau ? N'hésitez pas à nous contacter.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                  <MapPin className="text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold">Adresse</h4>
                  <p className="text-gray-600">Avenue Cheikh Anta Diop, Dakar, Sénégal</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                  <Phone className="text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold">Téléphone</h4>
                  <p className="text-gray-600">+221 33 123 45 67</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                  <Mail className="text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-600">contact@sunu-sante.sn</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-colors cursor-pointer">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-colors cursor-pointer">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors cursor-pointer">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white hover:bg-blue-900 transition-colors cursor-pointer">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Envoyez-nous un message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <Input id="name" placeholder="Votre nom" className="w-full border-gray-300" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input id="email" type="email" placeholder="Votre email" className="w-full border-gray-300" />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <Input id="subject" placeholder="Sujet de votre message" className="w-full border-gray-300" />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  placeholder="Votre message" 
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2"
                ></textarea>
              </div>
              
              <Button className="w-full bg-green-600 hover:bg-green-700 cursor-pointer">
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 