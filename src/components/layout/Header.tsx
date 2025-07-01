import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Stethoscope } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">

          <Stethoscope className="h-4 w-4 text-green-800" />
          <span className="text-xl font-bold text-green-800">Sunu Santé</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Accueil</a>
          <a href="#services" className="text-gray-600 hover:text-green-600 transition-colors">Services</a>
          <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Fonctionnalités</a>
          <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</a>
        </nav>
        
        <div className="hidden sm:block">
          <Link href="/login">
            <Button className="whitespace-nowrap bg-green-600 hover:bg-green-700 cursor-pointer flex items-center gap-2">
              {/*<Stethoscope className="h-4 w-4" />*/}
              Connexion Professionnel
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 