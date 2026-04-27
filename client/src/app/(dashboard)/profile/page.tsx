"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Clock, X, User } from "lucide-react";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
    }
  }

  async function handleUpload() {
    if (!cvFile) return;
    setUploading(true);
    // TODO: Call API to upload CV
    setTimeout(() => setUploading(false), 2000);
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
              <div className="text-center py-8">
                <div className="rounded-full bg-muted p-3 mx-auto w-fit mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No CVs uploaded yet
                </p>
              </div>
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
                <Input placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Phone
                </label>
                <Input placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Location
                </label>
                <Input placeholder="New York, NY" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  LinkedIn URL
                </label>
                <Input placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Portfolio URL
                </label>
                <Input placeholder="https://yourportfolio.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Years of Experience
                </label>
                <Input type="number" placeholder="5" min={0} max={50} />
              </div>
              <Button className="w-full mt-2">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
