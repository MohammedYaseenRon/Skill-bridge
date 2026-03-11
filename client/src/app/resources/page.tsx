"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Play,
  FileText,
  Lightbulb,
  Star,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Code2,
  BarChart3,
  Palette,
  Cpu,
  Layers,
  Users,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "All" | "Tutorials" | "Articles" | "Career Guides" | "Templates" | "Videos";
type Level = "All" | "Beginner" | "Intermediate" | "Advanced";

interface Resource {
  id: number;
  title: string;
  description: string;
  type: "tutorial" | "article" | "guide" | "template" | "video";
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  tags: string[];
  author: string;
  rating: number;
  reads: number;
  featured?: boolean;
  new?: boolean;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const RESOURCES: Resource[] = [
  // Tutorials
  {
    id: 1,
    title: "Complete React Developer Roadmap 2025",
    description: "A comprehensive guide covering React fundamentals to advanced patterns, hooks, and modern tooling used at top companies.",
    type: "tutorial",
    category: "Frontend",
    level: "Beginner",
    duration: "45 min",
    tags: ["React", "JavaScript", "Frontend"],
    author: "SkillBridge Team",
    rating: 4.9,
    reads: 12400,
    featured: true,
  },
  {
    id: 2,
    title: "Python for Data Science — Hands-On",
    description: "Learn pandas, NumPy, and matplotlib through real-world projects and datasets. Includes exercises and solutions.",
    type: "tutorial",
    category: "Data Science",
    level: "Beginner",
    duration: "60 min",
    tags: ["Python", "Data Science", "Pandas"],
    author: "Data Mentors",
    rating: 4.8,
    reads: 9800,
    featured: true,
  },
  {
    id: 3,
    title: "System Design for Senior Engineers",
    description: "Deep dive into distributed systems, caching, load balancing, and database design patterns used at FAANG companies.",
    type: "tutorial",
    category: "Backend",
    level: "Advanced",
    duration: "90 min",
    tags: ["System Design", "Architecture", "Backend"],
    author: "Priya Nair",
    rating: 4.9,
    reads: 7200,
  },
  {
    id: 4,
    title: "Docker & Kubernetes for Beginners",
    description: "Containerize your applications and deploy them to Kubernetes. Practical, zero-to-hero guide with hands-on labs.",
    type: "tutorial",
    category: "DevOps",
    level: "Beginner",
    duration: "55 min",
    tags: ["Docker", "Kubernetes", "DevOps"],
    author: "Cloud Mentors",
    rating: 4.7,
    reads: 6500,
    new: true,
  },
  // Articles
  {
    id: 5,
    title: "How to Land Your First Software Engineering Job in 90 Days",
    description: "A mentor-validated action plan: resume, LeetCode strategy, networking, and negotiation tips from engineers who hired at top companies.",
    type: "article",
    category: "Career",
    level: "Beginner",
    duration: "12 min read",
    tags: ["Job Search", "Career", "Interviews"],
    author: "Carlos Rivera",
    rating: 4.9,
    reads: 18700,
    featured: true,
  },
  {
    id: 6,
    title: "The Art of Technical Communication",
    description: "Why senior engineers are valued for communication as much as code. Learn to write clear documentation, RFCs, and code reviews.",
    type: "article",
    category: "Career",
    level: "Intermediate",
    duration: "8 min read",
    tags: ["Communication", "Career Growth", "Soft Skills"],
    author: "Aisha Patel",
    rating: 4.7,
    reads: 8300,
  },
  {
    id: 7,
    title: "AI/ML in 2025: What Learners Need to Know",
    description: "The evolving landscape of AI engineering — from LLM fine-tuning to MLOps. A roadmap for getting into ML engineering in 2025.",
    type: "article",
    category: "AI/ML",
    level: "Intermediate",
    duration: "15 min read",
    tags: ["AI", "Machine Learning", "Career"],
    author: "SkillBridge AI Team",
    rating: 4.8,
    reads: 11200,
    new: true,
  },
  {
    id: 8,
    title: "Negotiating Your Tech Salary: A Data-Driven Guide",
    description: "Real salary data, negotiation scripts, and counteroffers from 500+ tech negotiations. Helped mentees increase offers by an average of 22%.",
    type: "article",
    category: "Career",
    level: "All" as unknown as "Beginner",
    duration: "10 min read",
    tags: ["Salary", "Negotiation", "Career"],
    author: "Mentor Network",
    rating: 4.9,
    reads: 23500,
  },
  // Career Guides
  {
    id: 9,
    title: "The Complete Frontend Engineer Career Ladder",
    description: "Junior → Mid → Senior → Staff → Principal. Skills, expectations, salary ranges, and how to level up at each stage.",
    type: "guide",
    category: "Career",
    level: "Beginner",
    duration: "25 min read",
    tags: ["Career Ladder", "Frontend", "Growth"],
    author: "Mentors Panel",
    rating: 4.8,
    reads: 9100,
    featured: true,
  },
  {
    id: 10,
    title: "Switching Careers Into Data Science",
    description: "The definitive guide for non-technical professionals: timeline, required skills, portfolio projects, and job search strategy.",
    type: "guide",
    category: "Career",
    level: "Beginner",
    duration: "30 min read",
    tags: ["Career Change", "Data Science", "Roadmap"],
    author: "Data Career Team",
    rating: 4.7,
    reads: 6700,
  },
  // Templates
  {
    id: 11,
    title: "SWE Resume Template (ATS-Optimized)",
    description: "A clean, ATS-friendly resume template used by 5,000+ successful candidates. Includes guidance notes and example phrases.",
    type: "template",
    category: "Career",
    level: "Beginner",
    duration: "Instant download",
    tags: ["Resume", "Job Search", "ATS"],
    author: "SkillBridge Careers",
    rating: 4.9,
    reads: 31200,
    featured: true,
  },
  {
    id: 12,
    title: "30-60-90 Day Learning Plan Template",
    description: "A structured Notion template to plan your first months in a new role or a learning sprint. Mentor-reviewed.",
    type: "template",
    category: "Learning",
    level: "Beginner",
    duration: "Instant access",
    tags: ["Planning", "Learning", "Notion"],
    author: "Growth Mentors",
    rating: 4.6,
    reads: 4800,
    new: true,
  },
  // Videos
  {
    id: 13,
    title: "Mock Interview: Senior SWE at Google (Full Video)",
    description: "Watch a complete senior software engineer mock interview with real-time coach feedback. Covers data structures, system design, and behavioral questions.",
    type: "video",
    category: "Interviews",
    level: "Advanced",
    duration: "75 min",
    tags: ["Interview", "Google", "Behavioural"],
    author: "Tech Mentors",
    rating: 4.9,
    reads: 15600,
    featured: true,
  },
  {
    id: 14,
    title: "Next.js 15 Full-Stack App from Scratch",
    description: "Build a production-ready full-stack application using Next.js 15, TypeScript, Tailwind CSS, and Prisma. Deployed to Vercel.",
    type: "video",
    category: "Frontend",
    level: "Intermediate",
    duration: "3 hr 20 min",
    tags: ["Next.js", "TypeScript", "Full Stack"],
    author: "Build With Mentors",
    rating: 4.8,
    reads: 7900,
    new: true,
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, { label: Category; icon: React.ReactNode; color: string }> = {
  tutorial: { label: "Tutorials", icon: <Code2 className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-700" },
  article: { label: "Articles", icon: <FileText className="w-3.5 h-3.5" />, color: "bg-violet-100 text-violet-700" },
  guide: { label: "Career Guides", icon: <Lightbulb className="w-3.5 h-3.5" />, color: "bg-amber-100 text-amber-700" },
  template: { label: "Templates", icon: <Layers className="w-3.5 h-3.5" />, color: "bg-emerald-100 text-emerald-700" },
  video: { label: "Videos", icon: <Play className="w-3.5 h-3.5" />, color: "bg-rose-100 text-rose-700" },
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border border-amber-200",
  Advanced: "bg-red-50 text-red-700 border border-red-200",
};

const TOPIC_CATEGORIES = [
  { label: "All Topics", icon: <BookOpen className="w-4 h-4" />, value: "" },
  { label: "Frontend", icon: <Palette className="w-4 h-4" />, value: "Frontend" },
  { label: "Backend", icon: <Cpu className="w-4 h-4" />, value: "Backend" },
  { label: "Data Science", icon: <BarChart3 className="w-4 h-4" />, value: "Data Science" },
  { label: "Career", icon: <TrendingUp className="w-4 h-4" />, value: "Career" },
  { label: "DevOps", icon: <Layers className="w-4 h-4" />, value: "DevOps" },
  { label: "AI/ML", icon: <Cpu className="w-4 h-4" />, value: "AI/ML" },
  { label: "Interviews", icon: <Users className="w-4 h-4" />, value: "Interviews" },
];

// ─── Resource Card ────────────────────────────────────────────────────────────

function ResourceCard({ resource, saved, onToggleSave }: {
  resource: Resource;
  saved: boolean;
  onToggleSave: (id: number) => void;
}) {
  const typeInfo = TYPE_LABELS[resource.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col"
    >
      {/* Card header color bar */}
      <div className={`h-1 rounded-t-2xl ${
        resource.type === "video" ? "bg-gradient-to-r from-rose-400 to-pink-500" :
        resource.type === "tutorial" ? "bg-gradient-to-r from-blue-400 to-blue-600" :
        resource.type === "guide" ? "bg-gradient-to-r from-amber-400 to-orange-500" :
        resource.type === "template" ? "bg-gradient-to-r from-emerald-400 to-teal-500" :
        "bg-gradient-to-r from-violet-400 to-purple-500"
      }`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
              {typeInfo.icon}
              {typeInfo.label}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[resource.level] || "bg-slate-100 text-slate-600"}`}>
              {resource.level}
            </span>
            {resource.new && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">New</span>
            )}
            {resource.featured && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-900">Featured</span>
            )}
          </div>
          <button
            onClick={() => onToggleSave(resource.id)}
            className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 mt-0.5"
            title={saved ? "Remove bookmark" : "Bookmark"}
          >
            {saved ? <BookmarkCheck className="w-4 h-4 text-blue-600" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-xs leading-relaxed flex-1 mb-4">
          {resource.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {resource.duration}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {resource.rating}
            </span>
            <span>{resource.reads.toLocaleString()} reads</span>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            Open <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category>("All");
  const [topicFilter, setTopicFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<Level>("All");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [showSaved, setShowSaved] = useState(false);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      if (showSaved && !savedIds.has(r.id)) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
          !r.description.toLowerCase().includes(search.toLowerCase()) &&
          !r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (categoryFilter !== "All" && TYPE_LABELS[r.type]?.label !== categoryFilter) return false;
      if (topicFilter && r.category !== topicFilter) return false;
      if (levelFilter !== "All" && r.level !== levelFilter) return false;
      return true;
    });
  }, [search, categoryFilter, topicFilter, levelFilter, showSaved, savedIds]);

  const featured = RESOURCES.filter((r) => r.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={user?.is_mentor ? "/mentor" : "/user"}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Learning Resources</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Your Learning Library
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mb-8">
            Curated tutorials, articles, career guides, and templates — hand-picked by top mentors to help you grow faster.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources, topics, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-13 pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/15 transition-all text-sm"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8 text-sm">
            {[
              { value: `${RESOURCES.length}+`, label: "Resources" },
              { value: "50+", label: "Expert Authors" },
              { value: "4.8★", label: "Avg Rating" },
              { value: "Free", label: "Always" },
            ].map((s) => (
              <div key={s.label}>
                <span className="font-bold text-white text-lg">{s.value}</span>
                <span className="text-slate-400 ml-2">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured row */}
        {!search && categoryFilter === "All" && !topicFilter && levelFilter === "All" && !showSaved && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <h2 className="font-bold text-slate-900">Featured Resources</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ResourceCard resource={r} saved={savedIds.has(r.id)} onToggleSave={toggleSave} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Left sidebar — topic filter */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Topics</h3>
              <ul className="space-y-0.5">
                {TOPIC_CATEGORIES.map((tc) => (
                  <li key={tc.value}>
                    <button
                      onClick={() => setTopicFilter(tc.value)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                        topicFilter === tc.value
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className={topicFilter === tc.value ? "text-blue-600" : "text-slate-400"}>
                        {tc.icon}
                      </span>
                      {tc.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-100 mt-4 pt-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Level</h3>
                <ul className="space-y-0.5">
                  {(["All", "Beginner", "Intermediate", "Advanced"] as Level[]).map((lv) => (
                    <li key={lv}>
                      <button
                        onClick={() => setLevelFilter(lv)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                          levelFilter === lv
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {lv}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Type tabs */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
                {(["All", "Tutorials", "Articles", "Career Guides", "Templates", "Videos"] as Category[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      categoryFilter === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Saved filter */}
              <button
                onClick={() => setShowSaved(!showSaved)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  showSaved
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {showSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                Saved ({savedIds.size})
              </button>

              {/* Mobile level filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as Level)}
                className="lg:hidden border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {(["All", "Beginner", "Intermediate", "Advanced"] as Level[]).map((lv) => (
                  <option key={lv} value={lv}>{lv}</option>
                ))}
              </select>

              <span className="ml-auto text-xs text-slate-400">{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
                <p className="font-semibold text-slate-700 mb-1">No resources found</p>
                <p className="text-slate-400 text-sm">Try adjusting your filters or search query</p>
                <button
                  onClick={() => { setSearch(""); setCategoryFilter("All"); setTopicFilter(""); setLevelFilter("All"); setShowSaved(false); }}
                  className="mt-4 text-sm text-blue-600 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((r) => (
                    <ResourceCard key={r.id} resource={r} saved={savedIds.has(r.id)} onToggleSave={toggleSave} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
