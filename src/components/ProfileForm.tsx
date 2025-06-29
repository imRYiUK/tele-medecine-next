"use client";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Mail, Phone, Shield, Save } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  role: string;
  colorScheme?: "emerald" | "blue";
}

export default function ProfileForm({ role, colorScheme = "emerald" }: ProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would typically call an API to update the user profile
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Administrateur";
      case "ADMINISTRATEUR":
        return "Administrateur";
      case "MEDECIN":
        return "Médecin";
      case "RECEPTIONNISTE":
        return "Réceptionniste";
      case "RADIOLOGUE":
        return "Radiologue";
      case "TECHNICIEN":
        return "Technicien";
      default:
        return role;
    }
  };

  // Color scheme configuration
  const colors = {
    emerald: {
      primary: "emerald",
      gradient: "from-emerald-50 to-blue-50",
      border: "border-emerald-200",
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      button: "bg-emerald-600 hover:bg-emerald-700",
      icon: "text-emerald-600"
    },
    blue: {
      primary: "blue",
      gradient: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
      bg: "bg-blue-100",
      text: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      icon: "text-blue-600"
    }
  };

  const colorConfig = colors[colorScheme];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className={`bg-gradient-to-r ${colorConfig.gradient} ${colorConfig.border}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`${colorConfig.bg} p-3 rounded-full`}>
              <User className={`h-8 w-8 ${colorConfig.text}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.prenom} {user?.nom}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Shield className={`h-4 w-4 ${colorConfig.text}`} />
                <span className={`${colorConfig.text} font-medium`}>
                  {getRoleDisplayName(role)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg`}>
            <Save className={`h-5 w-5 ${colorConfig.text}`} />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nom" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nom
                </Label>
                <Input
                  id="nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input
                id="telephone"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
              />
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className={colorConfig.button}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg`}>
            <Shield className={`h-5 w-5 ${colorConfig.text}`} />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Changer le mot de passe</h4>
            <p className="text-sm text-gray-600 mb-3">
              Pour des raisons de sécurité, veuillez contacter l'administrateur pour changer votre mot de passe.
            </p>
            <Button variant="outline" disabled>
              Contacter l'administrateur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 