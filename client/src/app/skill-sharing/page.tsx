"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Users, BookOpen, MessageCircle, Heart, Share2,
  Search, Plus, TrendingUp, Award, Target, Flame,
} from "lucide-react";
import { api } from "@/lib/api";

interface Post {
  id: number;
  author_name: string;
  author_avatar: string;
  author_role: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  time_ago: string;
  liked: boolean;
}

interface TrendingTopic {
  tag: string;
  posts: number;
  trend: "up" | "steady";
}

// Static community data — in production this would come from an API
const TRENDING: TrendingTopic[] = [
  { tag: "Machine Learning", posts: 142, trend: "up" },
  { tag: "React", posts: 98, trend: "up" },
  { tag: "Career Change", posts: 76, trend: "steady" },
  { tag: "System Design", posts: 65, trend: "up" },
  { tag: "Python", posts: 54, trend: "steady" },
  { tag: "Leadership", posts: 43, trend: "up" },
];

const SAMPLE_POSTS: Post[] = [
  {
    id: 1, author_name: "Priya Sharma", author_avatar: "PS", author_role: "ML Engineer at Google",
    title: "5 things I wish I knew before switching to ML", time_ago: "2h ago",
    content: "After 3 years as a software engineer I made the switch to ML. Here are the most valuable lessons:\n\n1. Mathematics matters more than you think — brush up on linear algebra and probability.\n2. Start with classical ML before deep learning.\n3. Kaggle is your best friend for practice.\n4. Understanding the problem is 80% of the work.\n5. Find a mentor who has already made the transition.",
    tags: ["Machine Learning", "Career Change", "AI"], likes: 47, comments: 12, liked: false,
  },
  {
    id: 2, author_name: "Arjun Mehta", author_avatar: "AM", author_role: "Senior Product Designer",
    title: "How I went from developer to designer in 18 months", time_ago: "5h ago",
    content: "People said it couldn't be done quickly, but I'm living proof that career transitions are totally possible with the right focus and mentorship. Key things that helped me...\n\n• Daily design challenges (Daily UI)\n• Reading 'The Design of Everyday Things'\n• Getting honest feedback from designers\n• Building real projects, not just exercises",
    tags: ["UI/UX Design", "Career Change", "Product"], likes: 33, comments: 8, liked: false,
  },
  {
    id: 3, author_name: "Sarah Chen", author_avatar: "SC", author_role: "Data Scientist at Meta",
    title: "My SQL interview prep guide — everything I used to land FAANG", time_ago: "1d ago",
    content: "SQL interviews at top companies are surprisingly hard. After bombing my first attempt, I spent 2 months preparing systematically. Here's exactly what I studied:\n\n– Window functions (ROW_NUMBER, RANK, LAG/LEAD)\n– CTEs and recursive queries\n– Performance tuning and execution plans\n– Handling NULL values gracefully\n– Complex JOIN scenarios",
    tags: ["SQL", "Data Analysis", "Interview Prep"], likes: 89, comments: 24, liked: false,
  },
];

export default function SkillSharingPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated]);

  const handleLike = (id: number) => {
    setPosts(ps => ps.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
  };

  const handlePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const np: Post = {
      id: Date.now(), author_name: user?.full_name || "You", author_avatar: (user?.full_name || "Y").charAt(0).toUpperCase(),
      author_role: user?.is_mentor ? (user?.job_title || "Mentor") : "Learner",
      title: newTitle.trim(), content: newContent.trim(),
      tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      likes: 0, comments: 0, time_ago: "Just now", liked: false,
    };
    setPosts(prev => [np, ...prev]);
    setNewTitle(""); setNewContent(""); setNewTags(""); setShowNewPost(false);
  };

  const filtered = posts.filter(p => {
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(user?.is_mentor ? "/mentor" : "/user")} className="gap-1.5 text-slate-600">
            <ArrowLeft className="h-4 w-4" />Dashboard
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <Logo size="sm" />
          <div className="ml-auto flex items-center gap-3">
            <Button onClick={() => setShowNewPost(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 text-sm">
              <Plus className="h-4 w-4" /> Share Something
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main feed */}
          <div className="lg:col-span-3 space-y-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search posts, skills, topics…"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>

            {/* Filter tags */}
            {activeTag && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Filtered by:</span>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1 cursor-pointer" onClick={() => setActiveTag(null)}>
                  {activeTag} <span className="ml-1">×</span>
                </Badge>
              </div>
            )}

            {/* New post form */}
            {showNewPost && (
              <motion.div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-semibold text-slate-900 mb-4">Share your knowledge</h3>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title — what's your post about?"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={5} placeholder="Share your experience, tips, lessons learned…"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Tags: Python, React, Career (comma-separated)"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowNewPost(false)}>Cancel</Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl" onClick={handlePost} disabled={!newTitle.trim() || !newContent.trim()}>Publish Post</Button>
                </div>
              </motion.div>
            )}

            {/* Posts */}
            {filtered.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center text-slate-400">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No posts found. Be the first to share something!</p>
              </CardContent></Card>
            ) : filtered.map((post, i) => (
              <motion.div key={post.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {post.author_avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">{post.author_name}</div>
                    <div className="text-xs text-slate-500">{post.author_role} · {post.time_ago}</div>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 mb-2">{post.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-4">
                  {post.content.length > 300 ? post.content.slice(0, 300) + "…" : post.content}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map(tag => (
                    <button key={tag} onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${activeTag === tag ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                      #{tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                  <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}>
                    <Heart className={`h-4 w-4 ${post.liked ? "fill-red-500" : ""}`} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-4 w-4" /> {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors ml-auto">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Community stats */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Community</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Users className="h-4 w-4" /></div><div><div className="text-sm font-semibold text-slate-900">2,400+</div><div className="text-xs text-slate-500">Active members</div></div></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><BookOpen className="h-4 w-4" /></div><div><div className="text-sm font-semibold text-slate-900">850+</div><div className="text-xs text-slate-500">Posts this month</div></div></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center"><Award className="h-4 w-4" /></div><div><div className="text-sm font-semibold text-slate-900">120+</div><div className="text-xs text-slate-500">Expert contributors</div></div></div>
              </div>
            </div>

            {/* Trending topics */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Trending Topics</h3>
              <div className="space-y-2">
                {TRENDING.map((t, i) => (
                  <button key={t.tag} onClick={() => setActiveTag(t.tag === activeTag ? null : t.tag)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${activeTag === t.tag ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-700"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs w-4">#{i + 1}</span>
                      #{t.tag}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      {t.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                      {t.posts}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
