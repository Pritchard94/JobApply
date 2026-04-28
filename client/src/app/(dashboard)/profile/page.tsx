"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Clock, X, User, Loader2, Trash2, Check, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/store/user";
import { useNotificationStore } from "@/store/notification";
import { api, apiUpload } from "@/lib/api";

interface CV {
  id: string;
  file_name: string;
  file_url: string;
  parse_status: string;
  is_primary: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Personal info state
  const session = useUserStore((s) => s.session);
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url || "");
  const [experience, setExperience] = useState(profile?.years_of_experience || 0);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    if (!profile) setLoading(true);
    try {
      const [profileData, cvsData] = await Promise.all([
        api<any>("/settings", { token: session?.access_token }),
        api<CV[]>("/cv", { token: session?.access_token }),
      ]);
      setProfile(profileData);
      setCvs(cvsData);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, profile, setProfile]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setPortfolioUrl(profile.portfolio_url || "");
      setExperience(profile.years_of_experience || 0);
    }
  }, [profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
    }
  }

  async function handleUpload() {
    if (!cvFile || !session?.access_token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      const res = await apiUpload<CV>("/cv/upload", formData, session.access_token);
      setCvs([res, ...cvs]);
      setCvFile(null);
      useNotificationStore.getState().showSuccess("CV uploaded and parsing started!");
    } catch (error: any) {
      // Handled by api utility
    } finally {
      setUploading(false);
    }
  }

  async function handleSetPrimary(id: string) {
    if (!session?.access_token) return;
    try {
      await api(`/cv/${id}/set-primary`, {
        method: "POST",
        token: session.access_token,
      });
      setCvs(cvs.map(cv => ({
        ...cv,
        is_primary: cv.id === id
      })));
    } catch (error) {
      console.error("Failed to set primary CV:", error);
    }
  }

  async function handleDeleteCV(id: string) {
    if (!session?.access_token) return;
    if (!confirm("Are you sure you want to delete this CV?")) return;
    try {
      await api(`/cv/${id}`, {
        method: "DELETE",
        token: session.access_token,
      });
      setCvs(cvs.filter(cv => cv.id !== id));
    } catch (error) {
      console.error("Failed to delete CV:", error);
    }
  }

  async function handleSaveInfo() {
    if (!session?.access_token) return;
    setSaving(true);
    try {
      const res = await api<any>("/settings", {
        method: "PATCH",
        token: session.access_token,
        body: JSON.stringify({
          full_name: fullName,
          phone,
          location,
          linkedin_url: linkedinUrl,
          portfolio_url: portfolioUrl,
          years_of_experience: experience,
        }),
      });
      setProfile(res);
      useNotificationStore.getState().showSuccess("Personal information saved!");
    } catch (error: any) {
      // Handled by api utility
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile & CV</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and resumes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* CV Upload Section */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Upload CV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-accent/20 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  {cvFile ? (
                    <>
                      <p className="text-sm font-medium">{cvFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        Drop your CV here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF format, up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
              {cvFile && (
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? "Uploading..." : "Upload & Parse CV"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCvFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded CVs */}
          <Card>
            <CardHeader>
              <CardTitle>Your Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && cvs.length === 0 ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded-lg" />
                  ))}
                </div>
              ) : cvs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="rounded-full bg-muted p-3 mx-auto w-fit mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No CVs uploaded yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cvs.map((cv) => (
                    <div key={cv.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/20 transition-colors">
                      <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{cv.file_name}</p>
                          {cv.is_primary && (
                            <Badge variant="success" className="text-[10px] px-1.5 py-0">Primary</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Added on {new Date(cv.created_at).toLocaleDateString()} • Status: {cv.parse_status}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!cv.is_primary && (
                          <Button variant="ghost" size="icon" onClick={() => handleSetPrimary(cv.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => window.open(cv.file_url, "_blank")}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCV(cv.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personal Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Full Name
                </label>
                <Input 
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Phone
                </label>
                <Input 
                  placeholder="+1 (555) 000-0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Location
                </label>
                <Input 
                  placeholder="New York, NY" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  LinkedIn URL
                </label>
                <Input 
                  placeholder="https://linkedin.com/in/..." 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Portfolio URL
                </label>
                <Input 
                  placeholder="https://yourportfolio.com" 
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Years of Experience
                </label>
                <Input 
                  type="number" 
                  placeholder="5" 
                  min={0} 
                  max={50} 
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                />
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={handleSaveInfo}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
