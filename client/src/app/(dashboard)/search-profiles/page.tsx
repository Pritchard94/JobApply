"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import {
  Plus,
  Search,
  MapPin,
  Briefcase,
  Clock,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

interface SearchProfileData {
  id: string;
  name: string;
  job_titles: string[];
  locations: string[];
  is_active: boolean;
  search_frequency: string;
  last_searched_at: string | null;
}

export default function SearchProfilesPage() {
  const [profiles, setProfiles] = useState<SearchProfileData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTitles, setNewTitles] = useState("");
  const [newLocations, setNewLocations] = useState("");
  const [newFrequency, setNewFrequency] = useState("daily");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const profile: SearchProfileData = {
      id: Date.now().toString(),
      name: newName,
      job_titles: newTitles
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      locations: newLocations
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      is_active: true,
      search_frequency: newFrequency,
      last_searched_at: null,
    };
    setProfiles([...profiles, profile]);
    setShowCreate(false);
    setNewName("");
    setNewTitles("");
    setNewLocations("");
  }

  function toggleActive(id: string) {
    setProfiles(
      profiles.map((p) =>
        p.id === id ? { ...p, is_active: !p.is_active } : p,
      ),
    );
  }

  function deleteProfile(id: string) {
    setProfiles(profiles.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search Profiles</h1>
          <p className="text-muted-foreground mt-1">
            Configure what jobs to search for and where
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Profile
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No search profiles yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              Create your first search profile to start finding matching jobs
              across the internet
            </p>
            <Button className="mt-6" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create Your First Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className={!profile.is_active ? "opacity-60" : ""}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{profile.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={profile.is_active ? "success" : "pending"}>
                      {profile.is_active ? "Active" : "Paused"}
                    </Badge>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {profile.search_frequency}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(profile.id)}
                  >
                    {profile.is_active ? (
                      <ToggleRight className="h-5 w-5 text-primary" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProfile(profile.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {profile.job_titles.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {profile.locations.map((l) => (
                        <Badge key={l} variant="outline" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/search-profiles/${profile.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button size="sm" className="flex-1">
                    Search Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        className="max-w-md"
      >
        <ModalHeader>
          <ModalTitle>New Search Profile</ModalTitle>
          <ModalDescription>Define what jobs you want to find</ModalDescription>
        </ModalHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Profile Name
            </label>
            <Input
              placeholder="e.g., Remote React Jobs"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Job Titles (comma-separated)
            </label>
            <Input
              placeholder="Frontend Developer, React Engineer, UI Developer"
              value={newTitles}
              onChange={(e) => setNewTitles(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Locations (comma-separated)
            </label>
            <Input
              placeholder="London UK, Remote, New York NY"
              value={newLocations}
              onChange={(e) => setNewLocations(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Search Frequency
            </label>
            <select
              value={newFrequency}
              onChange={(e) => setNewFrequency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
