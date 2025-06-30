"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getRoleBasedRedirect } from '@/lib/utils/role-redirect';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Stethoscope, Shield } from "lucide-react"
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data);
      toast.success('Connexion réussie ! Redirection en cours...');
      const redirectPath = getRoleBasedRedirect(response.user.role);
      router.push(redirectPath);
    } catch (err: any) {
      toast.error('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Portail Médical</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Accédez aux dossiers patients en toute sécurité
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, (formErrors) => {
            if (formErrors.email || formErrors.password) {
              toast.error('Email ou mot de passe incorrect');
            }
          })} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse email
              </Label>
              <Input
                {...register('email')}
                id="email"
                name="email"
                type="email"
                placeholder="docteur@hopital.fr"
                required
                className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
              {errors.email && (
                <></>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe
              </Label>
              <Input
                {...register('password')}
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Connexion sécurisée - Données patients protégées
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 