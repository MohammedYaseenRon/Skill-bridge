"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, Video, MessageCircle, Phone, Star,
  CheckCircle, XCircle, AlertCircle, Loader2, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface SessionParty {
  id: number;
  full_name: string;
  email: string;
  job_title?: string;
  company?: string;
  hourly_rate?: number;
  skills?: string;
  location?: string;
}

interface Session {
  id: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  session_type: "video" | "chat" | "phone";
  topic?: string;
  notes?: string;
  scheduled_date: string;
  duration_minutes: number;
  learner_rating?: number;
  learner_review?: string;
  mentor_notes?: string;
  created_at: string;
  learner: SessionParty;
  mentor: SessionParty;
}

interface Props {
  isMentor?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  pending:   { label: "Pending",   bg: "bg-amber-50 text-amber-700 border-amber-200",   icon: AlertCircle  },
  confirmed: { label: "Confirmed", bg: "bg-blue-50 text-blue-700 border-blue-200",      icon: CheckCircle  },
  completed: { label: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  cancelled: { label: "Cancelled", bg: "bg-slate-100 text-slate-500 border-slate-200",  icon: XCircle      },
};

const TYPE_ICON = { video: Video, chat: MessageCircle, phone: Phone };

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange?.(n)} disabled={!onChange}
          className={`transition-colors ${n <= value ? "text-amber-400" : "text-slate-200 hover:text-amber-300"}`}>
          <Star className={`h-5 w-5 ${n <= value ? "fill-amber-400" : ""}`} />
        </button>
      ))}
    </div>
  );
}

export default function SessionDashboard({ isMentor = false, className = "" }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // review state
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<Session[]>("/api/sessions/my");
      setSessions(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const now = new Date();
  const upcoming = sessions.filter(s =>
    ["pending", "confirmed"].includes(s.status) && new Date(s.scheduled_date) >= now
  );
  const past = sessions.filter(s =>
    s.status === "completed" || s.status === "cancelled" ||
    (["pending", "confirmed"].includes(s.status) && new Date(s.scheduled_date) < now)
  );

  const displayed = activeTab === "upcoming" ? upcoming : past;

  const cancelSession = async (id: number) => {
    try {
      await api.patch(`/api/sessions/${id}/cancel`, {});
      fetchSessions();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to cancel");
    }
  };

  const confirmSession = async (id: number) => {
    try {
      await api.patch(`/api/sessions/${id}/confirm`, {});
      fetchSessions();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to confirm");
    }
  };

  const completeSession = async (id: number) => {
    try {
      await api.patch(`/api/sessions/${id}/complete`, {});
      fetchSessions();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to complete");
    }
  };

  const submitReview = async (sessionId: number) => {
    setSubmitting(true);
    try {
      await api.patch(`/api/sessions/${sessionId}/review`, { rating, review: reviewText });
      setReviewingId(null);
      setRating(5);
      setReviewText("");
      fetchSessions();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900">My Sessions</h2>
        <button onClick={fetchSessions} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <RotateCcw className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
        {(["upcoming", "past"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {tab} {tab === "upcoming" ? `(${upcoming.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4 text-center">
          {error}
          <button onClick={fetchSessions} className="block mx-auto mt-2 text-blue-600 hover:underline">Retry</button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No {activeTab} sessions</p>
          {activeTab === "upcoming" && <p className="text-xs mt-1">Find a mentor and book your first session!</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(s => {
            const cfg = STATUS_CONFIG[s.status];
            const TypeIcon = TYPE_ICON[s.session_type] || Video;
            const other = isMentor ? s.learner : s.mentor;
            const canCancel = ["pending", "confirmed"].includes(s.status);
            const canConfirm = isMentor && s.status === "pending";
            const canComplete = isMentor && s.status === "confirmed";
            const canReview = !isMentor && s.status === "completed" && !s.learner_rating;

            return (
              <motion.div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {other.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{other.full_name}</div>
                      <div className="text-xs text-slate-500">{isMentor ? "Learner" : (other.job_title || "Mentor")}</div>
                    </div>
                  </div>
                  <Badge className={`border text-xs ${cfg.bg}`}>{cfg.label}</Badge>
                </div>

                <div className="ml-13 space-y-1.5 mb-4 ml-[52px]">
                  {s.topic && <p className="text-sm font-medium text-slate-800">{s.topic}</p>}
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(s.scheduled_date)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(s.scheduled_date)} · {s.duration_minutes}min</span>
                    <span className="flex items-center gap-1"><TypeIcon className="h-3.5 w-3.5" />{s.session_type}</span>
                  </div>
                </div>

                {/* Review display */}
                {s.learner_rating && (
                  <div className="ml-[52px] mb-3 p-3 bg-amber-50 rounded-lg">
                    <StarRating value={s.learner_rating} />
                    {s.learner_review && <p className="text-xs text-slate-600 mt-1">"{s.learner_review}"</p>}
                  </div>
                )}

                {/* Review form */}
                {reviewingId === s.id && (
                  <div className="ml-[52px] mb-4 p-4 bg-slate-50 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-slate-700">Rate this session</p>
                    <StarRating value={rating} onChange={setRating} />
                    <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={2} placeholder="Share your experience..."
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setReviewingId(null)}>Cancel</Button>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => submitReview(s.id)} disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {(canCancel || canConfirm || canComplete || canReview) && (
                  <div className="ml-[52px] flex flex-wrap gap-2">
                    {canConfirm && <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs" onClick={() => confirmSession(s.id)}>Confirm</Button>}
                    {canComplete && <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs" onClick={() => completeSession(s.id)}>Mark Complete</Button>}
                    {canReview && !reviewingId && <Button size="sm" variant="outline" className="rounded-lg text-xs border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => setReviewingId(s.id)}>Leave Review</Button>}
                    {canCancel && <Button size="sm" variant="outline" className="rounded-lg text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => canCancel && cancelSession(s.id)}>Cancel</Button>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
