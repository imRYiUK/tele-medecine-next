"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { usersService, ProfileUpdateDto } from "@/lib/services/users.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Mail, Phone, Shield, Save, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  role: string;
  colorScheme?: "emerald" | "blue";
}

export default function ProfileForm({ role, colorScheme = "emerald" }: ProfileFormProps) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    username: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        telephone: user.telephone || "",
        username: user.username || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData: ProfileUpdateDto = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        username: form.username,
      };

      const updatedUser = await usersService.updateProfile(updateData);
      
      // Update the auth context with new user data
      updateUser(updatedUser);
      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour du profil";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setPasswordLoading(true);
    
    try {
      const updateData: ProfileUpdateDto = {
        password: passwordForm.newPassword,
      };

      await usersService.updateProfile(updateData);
      
      toast.success("Mot de passe mis à jour avec succès");
      
      // Clear password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error('Password update error:', error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour du mot de passe";
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
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
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom d'utilisateur
              </Label>
              <Input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

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
            <Lock className={`h-5 w-5 ${colorConfig.text}`} />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nouveau mot de passe"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirmer le mot de passe"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={passwordLoading || !passwordForm.newPassword || !passwordForm.confirmPassword} 
                variant="outline"
                className={colorConfig.button}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Changer le mot de passe
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 