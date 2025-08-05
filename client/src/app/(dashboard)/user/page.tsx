"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { GradientButton } from '@/components/ui/gradient-button';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, Calendar, BookOpen, User, LogOut, Star, Clock, MapPin } from 'lucide-react';

const UserDashboard: React.FC = () => {
  // Mock data for mentors
  const featuredMentors = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Software Engineer at Google",
      expertise: "React, TypeScript, System Design",
      experience: "8 years",
      rating: 4.9,
      location: "San Francisco, CA",
      hourlyRate: 75,
      image: "👩‍💻"
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Product Manager at Microsoft",
      expertise: "Product Strategy, UX Design, Analytics",
      experience: "6 years",
      rating: 4.8,
      location: "Seattle, WA",
      hourlyRate: 65,
      image: "👨‍💼"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Data Scientist at Netflix",
      expertise: "Machine Learning, Python, Statistics",
      experience: "5 years",
      rating: 4.9,
      location: "Los Angeles, CA",
      hourlyRate: 80,
      image: "👩‍🔬"
    }
  ];

  const recentActivity = [
    { action: "Scheduled session with John Doe", time: "2 hours ago", type: "calendar" },
    { action: "Completed lesson: Introduction to React", time: "1 day ago", type: "book" },
    { action: "New message from mentor Sarah", time: "2 days ago", type: "message" },
    { action: "Profile updated", time: "1 week ago", type: "user" }
  ];

  const upcomingSessions = [
    {
      mentor: "Sarah Johnson",
      topic: "React Best Practices",
      date: "Tomorrow",
      time: "2:00 PM"
    },
    {
      mentor: "Michael Chen",
      topic: "Product Roadmap Planning",
      date: "Friday",
      time: "10:00 AM"
    }
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo size="sm" />
          
          <div className="flex items-center gap-4">
            <GradientButton variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              {/* {user?.full_name} */}
            </GradientButton>
            <GradientButton variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </GradientButton>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            {/* Welcome back, <span className="gradient-primary bg-clip-text text-transparent">{user?.full_name}</span>! 👋 */}
          </h1>
          <p className="text-muted-foreground">Continue your learning journey and connect with amazing mentors.</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GradientButton variant="outline" className="h-16 flex-col gap-1">
            <Search className="h-5 w-5" />
            <span className="text-sm">Find Mentors</span>
          </GradientButton>
          
          <GradientButton variant="accent" className="h-16 flex-col gap-1">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Messages</span>
          </GradientButton>
          
          <GradientButton variant="accent" className="h-16 flex-col gap-1">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Schedule</span>
          </GradientButton>
          
          <GradientButton variant="accent" className="h-16 flex-col gap-1">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm">Resources</span>
          </GradientButton>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Mentors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Featured Mentors
                  </CardTitle>
                  <CardDescription>
                    Top-rated mentors that match your interests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featuredMentors.map((mentor, index) => (
                    <motion.div
                      key={mentor.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:shadow-soft transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-3xl">{mentor.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{mentor.name}</h3>
                        <p className="text-sm text-muted-foreground">{mentor.title}</p>
                        <p className="text-sm text-accent">{mentor.expertise}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs">{mentor.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{mentor.location}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            ${mentor.hourlyRate}/hr
                          </Badge>
                        </div>
                      </div>
                      <GradientButton size="sm" variant="primary">
                        Connect
                      </GradientButton>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest learning activities and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === 'calendar' && <Calendar className="h-4 w-4 text-primary" />}
                          {activity.type === 'book' && <BookOpen className="h-4 w-4 text-accent" />}
                          {activity.type === 'message' && <MessageCircle className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'user' && <User className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <motion.div
                      key={index}
                      className="p-3 rounded-lg bg-muted/30 border border-border"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <h4 className="font-medium text-sm">{session.topic}</h4>
                      <p className="text-xs text-muted-foreground">with {session.mentor}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-primary">{session.date}</span>
                        <span className="text-xs font-medium">{session.time}</span>
                      </div>
                    </motion.div>
                  ))}
                  
                  <GradientButton variant="outline" size="sm" className="w-full">
                    View All Sessions
                  </GradientButton>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Skills Acquired</span>
                      <span className="text-sm font-medium">12/20</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Sessions Completed</span>
                      <span className="text-sm font-medium">8/15</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '53%' }}></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <GradientButton variant="ghost" size="sm" className="w-full">
                      View Detailed Progress
                    </GradientButton>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default UserDashboard;