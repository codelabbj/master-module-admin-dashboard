"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useApi } from "@/lib/useApi";
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display";
import {
  Loader2,
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Settings,
  Clock
} from 'lucide-react';

interface UserProfile {
  uid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  display_name: string;
  is_verified: boolean;
  contact_method: string;
  created_at: string;
  updated_at: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const apiFetch = useApi();
  const { toast } = useToast();



  // Get token from localStorage (same as sign-in-form and dashboard layout)
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || "";
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch(`${baseUrl}/api/auth/profile/`);
        setProfile(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Erreur',
          description: 'Échec du chargement des données du profil',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast, router, token, apiFetch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiFetch(`${baseUrl}/api/auth/profile/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      });

      setProfile(data.user || data);
      setEditing(false);
      toast({
        title: 'Succès',
        description: data.message || 'Profil mis à jour avec succès',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMsg = extractErrorMessages(error) || 'Échec de la mise à jour du profil';
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError("");
    try {
      const data = await apiFetch(`${baseUrl}/api/auth/password-update/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      toast({
        title: "Succès",
        description: data.message || "Votre mot de passe a été mis à jour.",
      });
      setShowPasswordChange(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      const errorMsg = extractErrorMessages(error) || "Ancien mot de passe incorrect ou erreur serveur.";
      setPasswordError(errorMsg);
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-lg text-muted-foreground">Échec du chargement du profil. Veuillez réessayer plus tard.</p>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">
            Mon profil
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gérez vos informations de compte et paramètres
          </p>
        </div>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            variant="outline"
            className="flex items-center gap-2 hover-lift"
          >
            <Edit className="h-4 w-4" />
            Modifier le profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setEditing(false)}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2 hover-lift"
            >
              <X className="h-4 w-4" />
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="hover-lift"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Overview */}
      <Card className="minimal-card hover-lift">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src="" alt={profile.display_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                {getInitials(profile.display_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-3xl font-bold text-foreground">{profile.display_name}</div>
              <div className="text-muted-foreground mt-1">
                Membre depuis {new Date(profile.created_at).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={profile.is_active ? "default" : "secondary"}
                >
                  <div className="flex items-center gap-1">
                    {profile.is_active ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span>{profile.is_active ? 'Actif' : 'Inactif'}</span>
                  </div>
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span>Informations personnelles</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-foreground">Prénom</Label>
                  {editing ? (
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name || ''}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="minimal-input"
                      variant="minimal"
                    />
                  ) : (
                    <div className="text-foreground font-medium">{profile.first_name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-foreground">Nom de famille</Label>
                  {editing ? (
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name || ''}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="minimal-input"
                      variant="minimal"
                    />
                  ) : (
                    <div className="text-foreground font-medium">{profile.last_name}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <span>Informations de contact</span>
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Adresse e-mail</span>
                  </Label>
                  {editing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="minimal-input"
                      variant="minimal"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-foreground font-medium">{profile.email}</span>
                      {profile.email_verified ? (
                        <Badge variant="success">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Vérifié</span>
                          </div>
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            <span>Non vérifié</span>
                          </div>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Numéro de téléphone</span>
                  </Label>
                  {editing ? (
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="minimal-input"
                      variant="minimal"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-foreground font-medium">{profile.phone}</span>
                      {profile.phone_verified ? (
                        <Badge variant="success">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Vérifié</span>
                          </div>
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            <span>Non vérifié</span>
                          </div>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Settings className="h-4 w-4 text-purple-500" />
                </div>
                <span>Paramètres du compte</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Statut du compte</div>
                  <Badge
                    variant={profile.is_active ? "default" : "secondary"}
                  >
                    <div className="flex items-center gap-1">
                      {profile.is_active ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>{profile.is_active ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Méthode de contact préférée</div>
                  <Badge variant="info">
                    <div className="flex items-center gap-1">
                      {profile.contact_method === 'email' ? (
                        <Mail className="h-3 w-3" />
                      ) : (
                        <Phone className="h-3 w-3" />
                      )}
                      <span>{profile.contact_method === 'email' ? 'E-mail' : 'Téléphone'}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <span>Informations du compte</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">ID utilisateur</div>
                  <div className="text-foreground font-mono text-sm bg-accent/30 px-2 py-1 rounded">{profile.uid}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Dernière mise à jour</div>
                  <div className="text-foreground">
                    {new Date(profile.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Password Management */}
            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Shield className="h-4 w-4 text-red-500" />
                </div>
                <span>Sécurité</span>
              </h3>

              {!showPasswordChange ? (
                <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Mot de passe</div>
                    <div className="text-sm text-muted-foreground">Changez votre mot de passe pour sécuriser votre compte</div>
                  </div>
                  <Button
                    onClick={() => setShowPasswordChange(true)}
                    disabled={changingPassword}
                    variant="outline"
                  >
                    Changer le mot de passe
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleConfirmPasswordChange} className="bg-muted/30 p-6 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="old_password">Ancien mot de passe</Label>
                      <Input
                        id="old_password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Mot de passe actuel"
                        required
                        className="minimal-input"
                        variant="minimal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">Nouveau mot de passe</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        required
                        className="minimal-input"
                        variant="minimal"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPasswordChange(false)}
                      disabled={changingPassword}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={changingPassword}>
                      {changingPassword ? "Mise à jour..." : "Confirmer le changement"}
                    </Button>
                  </div>

                  {passwordError && (
                    <div className="mt-4">
                      <ErrorDisplay
                        error={passwordError}
                        variant="inline"
                        showRetry={false}
                        className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
                      />
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}