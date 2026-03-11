"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Video, MessageCircle, Phone, ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Mentor {
  id: number;
  full_name: string;
  job_title?: string;
  company?: string;
  hourly_rate?: number;
  skills?: string;
  location?: string;
}

interface SessionBookingProps {
  mentor: Mentor;
  onClose: () => void;
  onSuccess?: () => void;
}

const SESSION_TYPES = [
  { value: "video", label: "Video Call", icon: Video, desc: "Face-to-face via webcam" },
  { value: "chat", label: "Text Chat", icon: MessageCircle, desc: "Real-time messaging" },
  { value: "phone", label: "Phone Call", icon: Phone, desc: "Audio call only" },
];

const DURATIONS = [30, 45, 60, 90];

const TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
];

function getDatesForMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  // leading nulls
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SessionBooking({ mentor, onClose, onSuccess }: SessionBookingProps) {
  const today = new Date();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState("video");
  const [duration, setDuration] = useState(60);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = getDatesForMonth(viewYear, viewMonth);
  const isPast = (d: Date) => d < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsLoading(true);
    setError(null);
    try {
      const [h, m] = selectedTime.split(":").map(Number);
      const dt = new Date(selectedDate);
      dt.setHours(h, m, 0, 0);

      await api.post("/api/sessions", {
        mentor_id: mentor.id,
        scheduled_date: dt.toISOString(),
        duration_minutes: duration,
        session_type: sessionType,
        topic,
        notes,
      });
      setIsSuccess(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Booking failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const price = mentor.hourly_rate ? ((mentor.hourly_rate * duration) / 60).toFixed(0) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Book a Session</h2>
            <p className="text-sm text-slate-500 mt-0.5">with {mentor.full_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Mentor summary */}
        <div className="mx-6 mt-5 p-4 bg-slate-50 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {mentor.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900">{mentor.full_name}</div>
            <div className="text-sm text-slate-500">{mentor.job_title}{mentor.company ? ` · ${mentor.company}` : ""}</div>
          </div>
          {price && <Badge className="bg-blue-50 text-blue-700 border border-blue-200 shrink-0">${price} est.</Badge>}
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-6 pt-5 mb-4">
          {([1, 2, 3] as const).map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? "bg-blue-600" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex px-6 mb-6">
          {["Date & Time", "Session Details", "Confirm"].map((label, i) => (
            <div key={label} className="flex-1 text-xs text-slate-500">{label}</div>
          ))}
        </div>

        <div className="px-6 pb-6">
          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
                  <h3 className="font-semibold text-slate-900">{MONTH_NAMES[viewMonth]} {viewYear}</h3>
                  <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((d, i) => (
                    <div key={i} className="aspect-square">
                      {d ? (
                        <button
                          disabled={isPast(d)}
                          onClick={() => setSelectedDate(d)}
                          className={`w-full h-full rounded-lg text-sm font-medium transition-colors ${
                            isPast(d) ? "text-slate-300 cursor-not-allowed" :
                            selectedDate?.toDateString() === d.toDateString()
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-50 text-slate-700"
                          }`}
                        >
                          {d.getDate()}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time picker */}
              {selectedDate && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Available times for {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {TIMES.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`py-2 text-sm rounded-lg font-medium border transition-colors ${selectedTime === t ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Session details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Session Type</h4>
                <div className="grid grid-cols-3 gap-3">
                  {SESSION_TYPES.map(st => (
                    <button key={st.value} onClick={() => setSessionType(st.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm ${sessionType === st.value ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <st.icon className={`h-5 w-5 ${sessionType === st.value ? "text-blue-600" : "text-slate-500"}`} />
                      <span className="font-medium text-slate-900">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Duration</h4>
                <div className="flex gap-3">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${duration === d ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Topic / Goal <span className="text-red-400">*</span></label>
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Career change advice, code review, interview prep..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any specific questions or context for the mentor..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl" disabled={!topic.trim()} onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm mb-4">Booking Summary</h4>
                {[
                  { label: "Mentor", value: mentor.full_name },
                  { label: "Date", value: selectedDate?.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                  { label: "Time", value: selectedTime },
                  { label: "Duration", value: `${duration} minutes` },
                  { label: "Session type", value: SESSION_TYPES.find(s => s.value === sessionType)?.label },
                  { label: "Topic", value: topic },
                  ...(price ? [{ label: "Estimated cost", value: `$${price}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-900 text-right max-w-xs">{value}</span>
                  </div>
                ))}
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

              {isSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <CheckCircle className="h-4 w-4" /> Session booked successfully!
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(2)} disabled={isLoading}>Back</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2" onClick={handleBook} disabled={isLoading || isSuccess}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</> : "Confirm Booking"}
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center">Your mentor will be notified and can confirm the session.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
