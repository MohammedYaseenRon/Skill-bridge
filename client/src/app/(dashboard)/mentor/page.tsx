"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { GradientButton } from '@/components/ui/gradient-button';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageCircle, Users, TrendingUp, User, LogOut, Star, Clock, DollarSign, BookOpen } from 'lucide-react';

const MentorDashboard: React.FC = () => {

  // Mock data for mentees and activity
  const recentMentees = [
    {
      id: 1,
      name: "Alex Thompson",
      field: "Frontend Development",
      progress: 85,
      lastSession: "2 days ago",
      avatar: "👨‍💻"
    },
    {
      id: 2,
      name: "Maria Garcia",
      field: "UX Design",
      progress: 72,
      lastSession: "1 week ago", 
      avatar: "👩‍🎨"
    },
    {
      id: 3,
      name: "James Wilson",
      field: "Data Science",
      progress: 90,
      lastSession: "Yesterday",
      avatar: "👨‍🔬"
    }
  ];

  const upcomingSessions = [
    {
      mentee: "Alex Thompson",
      topic: "Advanced React Patterns",
      date: "Today",
      time: "3:00 PM"
    },
    {
      mentee: "Maria Garcia", 
      topic: "Design System Review",
      date: "Tomorrow",
      time: "11:00 AM"
    },
    {
      mentee: "James Wilson",
      topic: "ML Model Optimization",
      date: "Friday",
      time: "2:00 PM"
    }
  ];

  const stats = [
    { title: "Total Mentees", value: "24", icon: Users, color: "text-primary" },
    { title: "Sessions This Month", value: "18", icon: Calendar, color: "text-accent" },
    { title: "Average Rating", value: "4.8", icon: Star, color: "text-yellow-500" },
    { title: "Earnings This Month", value: "$1,240", icon: DollarSign, color: "text-green-500" }
  ];

  const recentActivity = [
    { action: "Completed session with Alex Thompson", time: "2 hours ago", type: "session" },
    { action: "New mentee request from Sarah Kim", time: "1 day ago", type: "request" },
    { action: "Payment received: $75", time: "2 days ago", type: "payment" },
    { action: "Profile viewed by 12 potential mentees", time: "3 days ago", type: "view" }
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo size="sm" />
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              Mentor
            </Badge>
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
            {/* Welcome, <span className="gradient-primary bg-clip-text text-transparent">{user?.full_name}</span>! 🌟 */}
          </h1>
          <p className="text-muted-foreground">Ready to inspire and guide your mentees to success?</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className="shadow-medium hover:shadow-strong transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GradientButton variant="primary" className="h-16 flex-col gap-1">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Schedule</span>
          </GradientButton>
          
          <GradientButton variant="accent" className="h-16 flex-col gap-1">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Messages</span>
          </GradientButton>
          
          <GradientButton variant="outline" className="h-16 flex-col gap-1">
            <Users className="h-5 w-5" />
            <span className="text-sm">My Mentees</span>
          </GradientButton>
          
          <GradientButton variant="ghost" className="h-16 flex-col gap-1">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Analytics</span>
          </GradientButton>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Mentees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Recent Mentees
                  </CardTitle>
                  <CardDescription>
                    Your most active mentees and their progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentMentees.map((mentee, index) => (
                    <motion.div
                      key={mentee.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:shadow-soft transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-3xl">{mentee.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{mentee.name}</h3>
                        <p className="text-sm text-muted-foreground">{mentee.field}</p>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">{mentee.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-gradient-primary h-1.5 rounded-full" 
                              style={{ width: `${mentee.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last session: {mentee.lastSession}
                        </p>
                      </div>
                      <GradientButton size="sm" variant="outline">
                        View Profile
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
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest mentoring activities and updates
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
                          {activity.type === 'session' && <BookOpen className="h-4 w-4 text-primary" />}
                          {activity.type === 'request' && <Users className="h-4 w-4 text-accent" />}
                          {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-500" />}
                          {activity.type === 'view' && <TrendingUp className="h-4 w-4 text-blue-500" />}
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
              transition={{ duration: 0.6, delay: 0.5 }}
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
                      <p className="text-xs text-muted-foreground">with {session.mentee}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-primary">{session.date}</span>
                        <span className="text-xs font-medium">{session.time}</span>
                      </div>
                    </motion.div>
                  ))}
                  
                  <GradientButton variant="primary" size="sm" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Schedule
                  </GradientButton>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>This Month's Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Sessions Goal</span>
                      <span className="text-sm font-medium">18/20</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Satisfaction Rate</span>
                      <span className="text-sm font-medium">96%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <GradientButton variant="outline" size="sm" className="w-full">
                      View Analytics
                    </GradientButton>
                    <GradientButton variant="ghost" size="sm" className="w-full">
                      Update Profile
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

export default MentorDashboard;