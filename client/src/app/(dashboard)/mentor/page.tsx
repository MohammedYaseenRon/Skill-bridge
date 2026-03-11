"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, MessageCircle, Users, TrendingUp, User, LogOut,
  Star, Clock, DollarSign, BookOpen, Bell, Settings,
  BarChart3, MapPin, Briefcase, Globe, Linkedin, Edit2, X, Loader2, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import SessionDashboard from '@/components/SessionDashboard';

interface MenteeSummary {
  id: number;
  name: string;
  email: string;
  field: string;
  progress: number;
  experience_level: string;
  location?: string;
}

interface DashboardData {
  mentor: {
    id: number;
    full_name: string;
    email: string;
    bio?: string;
    skills?: string;
    expertise?: string;
    experience_years?: number;
    hourly_rate?: number;
    company?: string;
    job_title?: string;
    location?: string;
    linkedin_url?: string;
    languages_spoken?: string;
    mentor_availability?: string;
  };
  stats: {
    total_mentees: number;
    total_mentors: number;
    sessions_this_month: number;
    average_rating: number;
    earnings_this_month: number;
  };
  recent_mentees: MenteeSummary[];
}

const avatarEmojis = ['👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '👨‍💼', '👩‍💼'];

const MentorDashboard: React.FC = () => {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Record<string, string | number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && !user.is_mentor) {
      router.push('/user');
      return;
    }
    if (isAuthenticated && user?.is_mentor) {
      fetchDashboard();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<DashboardData>('/api/users/mentor/dashboard');
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const openEditProfile = () => {
    if (!dashboardData) return;
    const m = dashboardData.mentor;
    setProfileForm({
      bio: m.bio || '',
      skills: m.skills || '',
      expertise: m.expertise || '',
      experience_years: m.experience_years || 0,
      hourly_rate: m.hourly_rate || 0,
      company: m.company || '',
      job_title: m.job_title || '',
      location: m.location || '',
      linkedin_url: m.linkedin_url || '',
      languages_spoken: m.languages_spoken || '',
      mentor_availability: m.mentor_availability || '',
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.put('/api/users/me', profileForm);
      setSaveSuccess(true);
      setEditingProfile(false);
      fetchDashboard(); // Refresh data
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Dashboard</h3>
            <p className="text-slate-500 mb-6 text-sm">{error}</p>
            <Button onClick={fetchDashboard} className="w-full">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mentor = dashboardData?.mentor;
  const stats = dashboardData?.stats;
  const recentMentees = dashboardData?.recent_mentees || [];

  const statsCards = [
    { title: "Total Mentees", value: stats?.total_mentees ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Sessions This Month", value: stats?.sessions_this_month ?? 0, icon: Calendar, color: "text-violet-600", bg: "bg-violet-50" },
    { title: "Average Rating", value: stats?.average_rating?.toFixed(1) ?? "–", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Earnings This Month", value: `$${(stats?.earnings_this_month ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="h-6 w-px bg-slate-200" />
            <Badge className="bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold">
              ✨ Mentor
            </Badge>
          </div>

          <nav className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all">
              <Bell className="h-4 w-4 text-slate-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button onClick={openEditProfile} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all" title="Edit Profile">
              <Edit2 className="h-4 w-4 text-slate-600" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <Button variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900 gap-2">
              <User className="h-4 w-4" />
              {mentor?.full_name?.split(' ')[0] || 'Profile'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Save Success Toast */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            Profile updated successfully!
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.section
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-600 p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-16" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {mentor?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              {mentor?.job_title && mentor?.company
                ? `${mentor.job_title} at ${mentor.company} • `
                : ''
              }
              Ready to inspire your mentees today?
            </p>
            {mentor?.skills && (
              <div className="flex flex-wrap gap-2 mt-4">
                {mentor.skills.split(',').slice(0, 4).map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/30">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.08 * index }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { icon: Calendar, label: "Schedule", color: "from-blue-600 to-blue-700 text-white", onClick: () => { } },
            { icon: MessageCircle, label: "Messages", color: "from-violet-600 to-violet-700 text-white", onClick: () => router.push("/messages") },
            { icon: Users, label: "My Mentees", color: "from-emerald-600 to-emerald-700 text-white", onClick: () => { } },
            { icon: BarChart3, label: "Analytics", color: "from-orange-500 to-orange-600 text-white", onClick: () => { } },
          ].map((action, i) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.onClick}
              className={`h-20 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${action.color} shadow-md hover:shadow-lg transition-all duration-200`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-semibold">{action.label}</span>
            </motion.button>
          ))}
        </motion.section>

        {/* Sessions Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <SessionDashboard isMentor={true} />
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Mentees */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Users className="h-5 w-5 text-primary" />
                    Recent Mentees
                  </CardTitle>
                  <CardDescription>Learners connected to your profile</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {recentMentees.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No mentees yet. Complete your profile to attract learners!</p>
                    </div>
                  ) : (
                    recentMentees.map((mentee, index) => (
                      <motion.div
                        key={mentee.id}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-200 cursor-pointer group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-2xl border border-primary/10">
                          {avatarEmojis[index % avatarEmojis.length]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">{mentee.name}</h3>
                          <p className="text-sm text-slate-500 truncate">{mentee.field || 'General Learning'}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Progress</span>
                                <span className="font-semibold text-primary">{mentee.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-700"
                                  style={{ width: `${mentee.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-0">
                            {mentee.experience_level || 'beginner'}
                          </Badge>
                          {mentee.location && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{mentee.location}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.section>

            {/* Mentor Profile Info Card */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <User className="h-5 w-5 text-primary" />
                      My Profile
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={openEditProfile} className="gap-2 text-xs">
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mentor?.bio && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-1">About</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{mentor.bio}</p>
                      </div>
                    )}
                    {mentor?.skills && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {mentor.skills.split(',').map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-xs rounded-full border border-primary/20 font-medium">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {[
                      { icon: Briefcase, label: 'Company', value: mentor?.company },
                      { icon: Briefcase, label: 'Job Title', value: mentor?.job_title },
                      { icon: MapPin, label: 'Location', value: mentor?.location },
                      { icon: Globe, label: 'Languages', value: mentor?.languages_spoken },
                      { icon: Clock, label: 'Availability', value: mentor?.mentor_availability },
                      { icon: DollarSign, label: 'Hourly Rate', value: mentor?.hourly_rate ? `$${mentor.hourly_rate}/hr` : 'Free' },
                    ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="text-sm text-slate-800 font-medium">{value}</p>
                        </div>
                      </div>
                    ))}
                    {mentor?.linkedin_url && (
                      <div className="sm:col-span-2">
                        <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Performance Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-900 text-base">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Sessions Goal</span>
                        <span className="text-sm font-bold text-primary">
                          {stats?.sessions_this_month ?? 0}/20
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-primary to-blue-500 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, ((stats?.sessions_this_month ?? 0) / 20) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Satisfaction Rate</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {stats?.average_rating ? `${((stats.average_rating / 5) * 100).toFixed(0)}%` : '—'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: stats?.average_rating ? `${(stats.average_rating / 5) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Mentee Capacity</span>
                        <span className="text-sm font-bold text-violet-600">
                          {stats?.total_mentees ?? 0}/50
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-purple-500 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, ((stats?.total_mentees ?? 0) / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Analytics
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={openEditProfile}>
                      <Settings className="h-3 w-3" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Quick Info */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-blue-600/5 border border-primary/10">
                <CardContent className="p-5 space-y-3">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Platform Overview
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Total Mentors', value: stats?.total_mentors ?? 0 },
                      { label: 'Total Learners', value: stats?.total_mentees ?? 0 },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-bold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </aside>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
              <button onClick={() => setEditingProfile(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'bio', label: 'Bio', type: 'textarea' },
                { key: 'skills', label: 'Skills (comma-separated)', type: 'text' },
                { key: 'expertise', label: 'Expertise (comma-separated)', type: 'text' },
                { key: 'job_title', label: 'Job Title', type: 'text' },
                { key: 'company', label: 'Company', type: 'text' },
                { key: 'location', label: 'Location', type: 'text' },
                { key: 'experience_years', label: 'Years of Experience', type: 'number' },
                { key: 'hourly_rate', label: 'Hourly Rate (USD, 0 for free)', type: 'number' },
                { key: 'languages_spoken', label: 'Languages Spoken', type: 'text' },
                { key: 'mentor_availability', label: 'Availability (e.g. Weekends, Evenings)', type: 'text' },
                { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={String(profileForm[key] || '')}
                      onChange={e => setProfileForm(prev => ({ ...prev, [key]: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    />
                  ) : (
                    <input
                      type={type}
                      value={String(profileForm[key] || '')}
                      onChange={e => setProfileForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 rounded-b-3xl px-6 py-4 flex gap-3">
              <Button variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
};

export default MentorDashboard;