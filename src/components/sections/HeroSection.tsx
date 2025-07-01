import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-transparent z-10"></div>
        <img 
          src="/images/hero-image.jpg" 
          alt="Télémedicine au Sénégal" 
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">La Télémedicine au Service de la Santé au Sénégal</h1>
            <p className="text-lg mb-8">Plateforme nationale de télémedecine et téléradiologie basée sur Orthanc pour le suivi des maladies nécessitant des images radiologiques avec un dossier médical partagé.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button className="whitespace-nowrap bg-white text-green-800 hover:bg-gray-100 text-base px-6 py-3 cursor-pointer">
                  Découvrir la plateforme
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 