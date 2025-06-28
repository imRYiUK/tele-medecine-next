"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MedecinProfilePage() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        nom: user?.nom || "",
        prenom: user?.prenom || "",
        email: user?.email || "",
        telephone: user?.telephone || "",
        // password: "", // For future password change
    });
    const [editing, setEditing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call update profile API
        setEditing(false);
    };

    return (
        <div className="space-y-6 p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">Mon Profil</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <Input name="nom" value={form.nom} onChange={handleChange} disabled={!editing} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Prénom</label>
                    <Input name="prenom" value={form.prenom} onChange={handleChange} disabled={!editing} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input name="email" value={form.email} onChange={handleChange} disabled={!editing} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Téléphone</label>
                    <Input name="telephone" value={form.telephone} onChange={handleChange} disabled={!editing} />
                </div>
                {/* <div>
          <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
          <Input name="password" type="password" value={form.password} onChange={handleChange} disabled={!editing} />
        </div> */}
                <div className="flex gap-2 mt-4">
                    {editing ? (
                        <>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Enregistrer</Button>
                            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
                        </>
                    ) : (
                        <Button type="button" onClick={() => setEditing(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">Modifier</Button>
                    )}
                </div>
            </form>
        </div>
    );
}