"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useMentorRecommendations } from '@/hooks/useRecommendation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign, User, Filter, Search, X, ArrowLeft, Loader2, Award, Linkedin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import SessionBooking from '@/components/SessionBooking';

export default function FindMentorsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { recommendations, isLoading, error, fetchRecommendations } = useMentorRecommendations();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingMentor, setBookingMentor] = useState<{ id: number; full_name: string; job_title?: string; company?: string; hourly_rate?: number; skills?: string; location?: string } | null>(null);
  const [filters, setFilters] = useState({
    max_hourly_rate: undefined as number | undefined,
    min_experience_years: undefined as number | undefined,
    location: '',
    min_score: 0,
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchRecommendations(20, {});
    }
  }, [authLoading, isAuthenticated, user]);

  const handleApplyFilters = () => {
    fetchRecommendations(20, filters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ max_hourly_rate: undefined, min_experience_years: undefined, location: '', min_score: 0 });
    setSearchQuery('');
    fetchRecommendations(20, {});
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  // Filter by search query in frontend
  const filteredRecommendations = recommendations.filter(mentor => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      mentor.mentor_name.toLowerCase().includes(q) ||
      (mentor.mentor_skills || '').toLowerCase().includes(q) ||
      (mentor.mentor_expertise || '').toLowerCase().includes(q) ||
      (mentor.mentor_location || '').toLowerCase().includes(q) ||
      (mentor.mentor_company || '').toLowerCase().includes(q) ||
      (mentor.mentor_job_title || '').toLowerCase().includes(q)
    );
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-md w-full mx-4 shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign In Required</h2>
            <p className="text-slate-500 mb-6">Please sign in to view personalized mentor recommendations.</p>
            <Button onClick={() => router.push('/login')} className="w-full gap-2">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/user')} className="gap-2 text-slate-600">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <Logo size="sm" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(filters.max_hourly_rate || filters.min_experience_years || filters.location) && (
              <span className="w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Find Your Perfect Mentor
          </h1>
          <p className="text-slate-500 text-lg">
            Personalized recommendations powered by AI — matched to your learning goals
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, skills, location, company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-800 placeholder:text-slate-400 shadow-sm text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-900">Filter Mentors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Max Hourly Rate ($)</label>
                      <input
                        type="number"
                        placeholder="e.g., 100"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                        value={filters.max_hourly_rate || ''}
                        onChange={e => setFilters(prev => ({
                          ...prev,
                          max_hourly_rate: e.target.value ? Number(e.target.value) : undefined
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Min Experience (years)</label>
                      <input
                        type="number"
                        placeholder="e.g., 3"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                        value={filters.min_experience_years || ''}
                        onChange={e => setFilters(prev => ({
                          ...prev,
                          min_experience_years: e.target.value ? Number(e.target.value) : undefined
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                      <input
                        type="text"
                        placeholder="e.g., San Francisco"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                        value={filters.location}
                        onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleApplyFilters} className="gap-2">
                      <Filter className="h-4 w-4" />
                      Apply Filters
                    </Button>
                    <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        {!isLoading && !error && filteredRecommendations.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-500 mb-5"
          >
            Showing <span className="font-bold text-slate-800">{filteredRecommendations.length}</span> mentors
            {searchQuery && ` matching "${searchQuery}"`}
          </motion.p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-slate-500 font-medium">Finding your perfect mentors...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-10 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Mentors</h3>
              <p className="text-slate-500 text-sm mb-6">{error}</p>
              <Button onClick={() => fetchRecommendations(20, {})} className="gap-2">
                <Loader2 className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mentor Cards Grid */}
        {!isLoading && !error && filteredRecommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRecommendations.map((mentor, index) => (
              <motion.div
                key={mentor.mentor_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white group h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl flex items-center justify-center text-2xl border border-primary/10 flex-shrink-0">
                          {['👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬', '👨‍💼', '👩‍💼'][mentor.mentor_id % 6]}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base text-slate-900 truncate group-hover:text-primary transition-colors">
                            {mentor.mentor_name}
                          </CardTitle>
                          {mentor.mentor_job_title && (
                            <p className="text-xs text-slate-500 truncate">{mentor.mentor_job_title}</p>
                          )}
                          {mentor.mentor_company && (
                            <p className="text-xs text-slate-400 truncate">{mentor.mentor_company}</p>
                          )}
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex-shrink-0 ${getScoreColor(mentor.recommendation_score.total_score)}`}>
                        {mentor.recommendation_score.total_score.toFixed(0)}%
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    {/* Bio */}
                    {mentor.mentor_bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{mentor.mentor_bio}</p>
                    )}

                    {/* Info Row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                      {mentor.mentor_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{mentor.mentor_location}
                        </span>
                      )}
                      {mentor.mentor_experience_years && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{mentor.mentor_experience_years}+ yrs
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <DollarSign className="h-3 w-3" />
                        {mentor.mentor_hourly_rate === 0 ? 'Free' : `$${mentor.mentor_hourly_rate}/hr`}
                      </span>
                    </div>

                    {/* Skills */}
                    {mentor.common_skills.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-1.5">Skills Match</p>
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.common_skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary text-xs rounded-lg border border-primary/20 font-medium">
                              {skill}
                            </span>
                          ))}
                          {mentor.common_skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg">
                              +{mentor.common_skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Match Reasons */}
                    {mentor.match_reasons.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-1.5">Why This Match</p>
                        <ul className="space-y-1">
                          {mentor.match_reasons.slice(0, 2).map((reason, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Score Breakdown */}
                    <div className="border-t border-slate-100 pt-3 mt-auto">
                      <div className="grid grid-cols-4 gap-1 text-center">
                        {[
                          { label: 'Skills', value: mentor.recommendation_score.skills_match },
                          { label: 'Location', value: mentor.recommendation_score.location_match },
                          { label: 'Language', value: mentor.recommendation_score.language_match },
                          { label: 'Experience', value: mentor.recommendation_score.experience_match },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div className="text-xs font-bold text-slate-700">{value.toFixed(0)}%</div>
                            <div className="text-[10px] text-slate-400">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                        onClick={() => setBookingMentor({
                          id: mentor.mentor_id,
                          full_name: mentor.mentor_name,
                          job_title: mentor.mentor_job_title,
                          company: mentor.mentor_company,
                          hourly_rate: mentor.mentor_hourly_rate,
                          skills: mentor.mentor_skills,
                          location: mentor.mentor_location,
                        })}
                      >
                        <Calendar className="h-3 w-3" />
                        Book Session
                      </Button>
                      {mentor.mentor_linkedin_url && (
                        <a
                          href={mentor.mentor_linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <Linkedin className="h-4 w-4 text-blue-600" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredRecommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="p-14 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Mentors Found</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  {searchQuery
                    ? `No mentors matching "${searchQuery}". Try a different search.`
                    : 'Try adjusting your filters or update your learning profile for better matches.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleClearFilters} variant="outline">Clear Filters</Button>
                  <Button onClick={() => fetchRecommendations(20, {})}>Refresh</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Session Booking Modal */}
      {bookingMentor && (
        <SessionBooking
          mentor={bookingMentor}
          onClose={() => setBookingMentor(null)}
          onSuccess={() => setBookingMentor(null)}
        />
      )}
    </div>
  );
}