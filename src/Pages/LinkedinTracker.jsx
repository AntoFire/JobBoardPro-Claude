import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, TrendingUp, MessageSquare, Calendar } from "lucide-react";
import AddProfileForm from "../components/linkedin/AddProfileForm";
import ProfileKanbanBoard from "../components/linkedin/ProfileKanbanBoard";
import ProfileFilters from "../components/linkedin/ProfileFilters";

export default function LinkedInTracker() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    searchTerm: "",
    company: "all",
    location: "all",
    status: "all"
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(console.error);
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['linkedin-profiles'],
    queryFn: () => base44.entities.LinkedInProfile.list(),
  });

  const updateGamification = async (action) => {
    if (!currentUser) return;
    const g = currentUser.gamification ? { ...currentUser.gamification } : {
      total_points: 0, level: 1, achievements: [], current_streak: 0, longest_streak: 0, last_activity_date: null
    };
    const pointsMap = { linkedin_added: 3, linkedin_connected: 10 };
    let points = pointsMap[action] || 0;
    const allProfiles = await queryClient.fetchQuery({
      queryKey: ['linkedin-profiles'],
      queryFn: () => base44.entities.LinkedInProfile.list()
    });
    const total = allProfiles.length;
    const achievements = [...g.achievements];
    if (total >= 5 && !achievements.includes('networking_starter')) { achievements.push('networking_starter'); points += 15; }
    if (total >= 20 && !achievements.includes('networking_pro')) { achievements.push('networking_pro'); points += 40; }
    if (total >= 50 && !achievements.includes('social_butterfly')) { achievements.push('social_butterfly'); points += 80; }
    const newPoints = g.total_points + points;
    const LEVELS = [0, 50, 150, 300, 500, 800, 1200];
    let newLevel = 1;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (newPoints >= LEVELS[i]) { newLevel = i + 1; break; }
    }
    const today = new Date().toISOString().split('T')[0];
    let newStreak = g.current_streak;
    if (g.last_activity_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      newStreak = g.last_activity_date === yesterday.toISOString().split('T')[0] ? newStreak + 1 : 1;
    }
    if (newStreak >= 7 && !achievements.includes('streak_master')) { achievements.push('streak_master'); points += 50; }
    await base44.auth.updateMe({
      gamification: {
        total_points: newPoints,
        level: newLevel,
        achievements,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, g.longest_streak || 0),
        last_activity_date: today
      }
    });
    const updatedUser = await base44.auth.me();
    setCurrentUser(updatedUser);
  };

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.LinkedInProfile.update(id, { status }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-profiles'] });
      if (variables.status === 'Connected') updateGamification('linkedin_connected');
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id) => base44.entities.LinkedInProfile.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['linkedin-profiles'] }),
  });

  const handleColumnDelete = async (status) => {
    const toDelete = profiles.filter(p => p.status === status);
    await Promise.all(toDelete.map(p => base44.entities.LinkedInProfile.delete(p.id)));
    queryClient.invalidateQueries({ queryKey: ['linkedin-profiles'] });
  };

  const filteredProfiles = profiles.filter(profile => {
    if (filters.searchTerm) {
      const s = filters.searchTerm.toLowerCase();
      if (!profile.name?.toLowerCase().includes(s) && !profile.title?.toLowerCase().includes(s) && !profile.company?.toLowerCase().includes(s)) return false;
    }
    if (filters.company !== "all" && profile.company !== filters.company) return false;
    if (filters.location !== "all" && profile.location !== filters.location) return false;
    if (filters.status !== "all" && profile.status !== filters.status) return false;
    return true;
  });

  const stats = {
    total: filteredProfiles.length,
    connected: filteredProfiles.filter(p => p.status === "Connected").length,
    messaged: filteredProfiles.filter(p => p.status === "Messaged" || p.status === "Follow-up").length,
    meetings: filteredProfiles.filter(p => p.status === "Meeting Scheduled").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LinkedIn Profile Tracker</h1>
              <p className="text-gray-600">Manage your professional network</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Profiles", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Connected", value: stats.connected, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
            { label: "Messaged", value: stats.messaged, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100" },
            { label: "Meetings", value: stats.meetings, icon: Calendar, color: "text-orange-600", bg: "bg-orange-100" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <AddProfileForm onProfileAdded={async () => {
          queryClient.invalidateQueries({ queryKey: ['linkedin-profiles'] });
          await updateGamification('linkedin_added');
        }} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Pipeline</h2>
          <div className="mb-6">
            <ProfileFilters profiles={profiles} onFilterChange={setFilters} />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {profiles.length === 0 ? "No profiles yet" : "No profiles match your filters"}
              </p>
            </div>
          ) : (
            <ProfileKanbanBoard
              profiles={filteredProfiles}
              onProfileMove={(id, status) => updateProfileMutation.mutate({ id, status })}
              onProfileDelete={(id) => deleteProfileMutation.mutate(id)}
              onColumnDelete={handleColumnDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
