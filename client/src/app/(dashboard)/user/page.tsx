"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import PageWrapper from "@/components/PageWrapper";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, MessageCircle, Calendar, BookOpen, User, LogOut,
  Star, MapPin, Briefcase, DollarSign, Clock, Globe,
  TrendingUp, Sparkles, Users, Edit2, X, Loader2, CheckCircle, Target, Share2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import SessionDashboard from "@/components/SessionDashboard";
import SkillManagement from "@/components/SkillManagement";

interface FeaturedMentor {
  id: number;
  full_name: string;
  email: string;
  bio?: string;
  skills?: string;
  expertise?: string;
  experience_years?: number;
  hourly_rate?: number;
  location?: string;
  company?: string;
  job_title?: string;
  rating?: number;
}

interface DashboardData {
  learner: {
    id: number;
    full_name: string;
    email: string;
    bio?: string;
    learning_goal?: string;
    skills_interested?: string;
    current_skills?: string;
    experience_level?: string;
    learning_style?: string;
    location?: string;
  };
  stats: {
    total_mentors_available: number;
    sessions_completed: number;
    skills_learning: number;
  };
  featured_mentors: FeaturedMentor[];
}

const UserDashboard: React.FC = () => {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && user?.is_mentor) {
      router.push('/mentor');
      return;
    }
    if (isAuthenticated && user && !user.is_mentor) {
      fetchDashboard();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<DashboardData>('/api/users/learner/dashboard');
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
    const l = dashboardData.learner;
    setProfileForm({
      bio: l.bio || '',
      learning_goal: l.learning_goal || '',
      skills_interested: l.skills_interested || '',
      current_skills: l.current_skills || '',
      experience_level: l.experience_level || '',
      learning_style: l.learning_style || '',
      location: l.location || '',
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.put('/api/users/me', profileForm);
      setSaveSuccess(true);
      setEditingProfile(false);
      fetchDashboard();
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
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Dashboard</h3>
            <p className="text-slate-500 mb-6 text-sm">{error}</p>
            <Button onClick={fetchDashboard} className="w-full">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const learner = dashboardData?.learner;
  const stats = dashboardData?.stats;
  const featuredMentors = dashboardData?.featured_mentors || [];

  const statsCards = [
    { title: "Mentors Available", value: stats?.total_mentors_available ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Sessions Completed", value: stats?.sessions_completed ?? 0, icon: Calendar, color: "text-violet-600", bg: "bg-violet-50" },
    { title: "Skills Learning", value: stats?.skills_learning ?? 0, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="h-6 w-px bg-slate-200" />
            <Badge className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
              🌱 Learner
            </Badge>
          </div>

          <nav className="flex items-center gap-2">
            <button onClick={openEditProfile} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all" title="Edit Profile">
              <Edit2 className="h-4 w-4 text-slate-600" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <Button variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900 gap-2">
              <User className="h-4 w-4" />
              {learner?.full_name?.split(' ')[0] || 'Profile'}
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
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
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-16" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {learner?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl">
              {learner?.learning_goal
                ? `Goal: ${learner.learning_goal}`
                : 'Continue your learning journey and connect with amazing mentors.'}
            </p>
            {learner?.skills_interested && (
              <div className="flex flex-wrap gap-2 mt-4">
                {learner.skills_interested.split(',').slice(0, 4).map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/30">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
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
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {[
            { icon: Sparkles, label: "AI Agent", color: "from-violet-600 to-purple-700 text-white", onClick: () => router.push("/agent") },
            { icon: Search, label: "Find Mentors", color: "from-blue-600 to-blue-700 text-white", onClick: () => router.push("/user/recommendations") },
            { icon: MessageCircle, label: "Messages", color: "from-emerald-600 to-emerald-700 text-white", onClick: () => router.push("/messages") },
            { icon: Share2, label: "Community", color: "from-orange-500 to-orange-600 text-white", onClick: () => router.push("/skill-sharing") },
            { icon: BookOpen, label: "Resources", color: "from-slate-600 to-slate-700 text-white", onClick: () => router.push("/resources") },
          ].map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={action.onClick}
              className={`h-20 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${action.color} shadow-md hover:shadow-lg transition-all duration-200`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-xs font-semibold">{action.label}</span>
            </motion.button>
          ))}
        </motion.section>

        {/* Sessions Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SessionDashboard isMentor={false} />
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Mentors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-900">
                        <Star className="h-5 w-5 text-amber-500" />
                        Top Mentors For You
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Personalized recommendations based on your learning goals
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/user/recommendations')}
                      className="text-xs gap-1"
                    >
                      <Search className="h-3 w-3" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {featuredMentors.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No mentors found. Try updating your skills in your profile!</p>
                      <Button variant="outline" size="sm" onClick={openEditProfile} className="mt-3">
                        Update Profile
                      </Button>
                    </div>
                  ) : (
                    featuredMentors.map((mentor, index) => (
                      <motion.div
                        key={mentor.id}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all duration-200 cursor-pointer group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => router.push('/user/recommendations')}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-3xl border border-primary/10 flex-shrink-0">
                          {['👩‍💻', '👨‍💼', '👩‍🔬'][index % 3]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">{mentor.full_name}</h3>
                              {mentor.job_title && mentor.company && (
                                <p className="text-sm text-slate-500 truncate">
                                  {mentor.job_title} at {mentor.company}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-bold text-slate-800">{mentor.rating?.toFixed(1)}</span>
                            </div>
                          </div>
                          {mentor.skills && (
                            <p className="text-xs text-primary mt-1 truncate">{mentor.skills.split(',').slice(0, 3).join(' • ')}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {mentor.location && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <MapPin className="h-3 w-3" />{mentor.location}
                              </span>
                            )}
                            {mentor.experience_years && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />{mentor.experience_years}+ years
                              </span>
                            )}
                            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-0">
                              {mentor.hourly_rate === 0 ? 'Free' : `$${mentor.hourly_rate}/hr`}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="flex-shrink-0 text-primary hover:bg-primary/10">
                          Connect
                        </Button>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* My Learning Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Target className="h-5 w-5 text-emerald-600" />
                      My Learning Profile
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={openEditProfile} className="gap-1 text-xs">
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {learner?.learning_goal && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-1">Learning Goal</p>
                        <p className="text-sm text-slate-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          🎯 {learner.learning_goal}
                        </p>
                      </div>
                    )}
                    {learner?.skills_interested && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-2">Skills to Learn</p>
                        <div className="flex flex-wrap gap-2">
                          {learner.skills_interested.split(',').map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200 font-medium">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {learner?.current_skills && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-2">Current Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {learner.current_skills.split(',').map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {[
                      { icon: TrendingUp, label: 'Experience Level', value: learner?.experience_level },
                      { icon: BookOpen, label: 'Learning Style', value: learner?.learning_style },
                      { icon: MapPin, label: 'Location', value: learner?.location },
                    ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="text-sm text-slate-800 font-medium capitalize">{value}</p>
                        </div>
                      </div>
                    ))}
                    {!learner?.learning_goal && !learner?.skills_interested && (
                      <div className="sm:col-span-2 text-center py-6 text-slate-400">
                        <p className="text-sm">Your profile is incomplete. Add your learning goals to get better mentor recommendations!</p>
                        <Button variant="outline" size="sm" onClick={openEditProfile} className="mt-3">
                          Complete Profile
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-slate-900 text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Sessions Completed</span>
                      <span className="text-sm font-bold text-primary">{stats?.sessions_completed ?? 0}/15</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-primary to-blue-500 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, ((stats?.sessions_completed ?? 0) / 15) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Skills Learning</span>
                      <span className="text-sm font-bold text-emerald-600">{stats?.skills_learning ?? 0}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, ((stats?.skills_learning ?? 0) / 10) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => router.push('/user/recommendations')}>
                    View Full Progress
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skill Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <SkillManagement
                currentSkills={learner?.current_skills}
                skillsInterested={learner?.skills_interested}
                onSave={fetchDashboard}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Learning Profile</h2>
              <button onClick={() => setEditingProfile(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'bio', label: 'Bio', type: 'textarea' },
                { key: 'learning_goal', label: 'Learning Goal', type: 'text', placeholder: 'What do you want to achieve?' },
                { key: 'skills_interested', label: 'Skills to Learn (comma-separated)', type: 'text', placeholder: 'React, Python, Data Science' },
                { key: 'current_skills', label: 'Current Skills (comma-separated)', type: 'text', placeholder: 'HTML, CSS, JavaScript' },
                { key: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={profileForm[key] || ''}
                      onChange={e => setProfileForm(prev => ({ ...prev, [key]: e.target.value }))}
                      rows={3}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    />
                  ) : (
                    <input
                      type={type}
                      value={profileForm[key] || ''}
                      onChange={e => setProfileForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={profileForm['experience_level'] || ''}
                  onChange={e => setProfileForm(prev => ({ ...prev, experience_level: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Learning Style</label>
                <select
                  value={profileForm['learning_style'] || ''}
                  onChange={e => setProfileForm(prev => ({ ...prev, learning_style: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                >
                  <option value="">Select style</option>
                  <option value="visual">Visual</option>
                  <option value="hands-on">Hands-on</option>
                  <option value="theoretical">Theoretical</option>
                  <option value="project-based">Project-based</option>
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 rounded-b-3xl px-6 py-4 flex gap-3">
              <Button variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
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

export default UserDashboard;
