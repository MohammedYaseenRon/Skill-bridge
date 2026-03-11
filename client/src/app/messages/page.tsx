"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Search,
  MessageCircle,
  CheckCheck,
  Check,
  User,
  MoreVertical,
  Phone,
  Video,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartnerUser {
  id: number;
  full_name: string;
  email: string;
  is_mentor: boolean;
  profile_picture_url?: string;
  job_title?: string;
  company?: string;
}

interface Conversation {
  partner_id: number;
  partner: PartnerUser;
  last_message: string;
  last_message_at: string;
  is_mine: boolean;
  unread_count: number;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  is_mine: boolean;
  is_read: boolean;
  created_at: string;
}

interface Thread {
  partner: PartnerUser;
  messages: Message[];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = "md" }: { user: PartnerUser; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" }[size];
  const initials = user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Time formatter ───────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.get<Conversation[]>("/api/messages/conversations");
      setConversations(data);
    } catch {
      // silent
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  // Fetch thread
  const fetchThread = useCallback(async (partnerId: number) => {
    setLoadingThread(true);
    try {
      const data = await api.get<Thread>(`/api/messages/${partnerId}`);
      setActiveThread(data);
      // Update unread count in conversations list
      setConversations((prev) =>
        prev.map((c) => (c.partner_id === partnerId ? { ...c, unread_count: 0 } : c))
      );
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  // Open a conversation
  const openConversation = useCallback(
    (partnerId: number) => {
      setActivePartnerId(partnerId);
      setMobileView("thread");
      fetchThread(partnerId);
    },
    [fetchThread]
  );

  // Poll for new messages when a thread is open
  useEffect(() => {
    if (!activePartnerId) return;
    pollRef.current = setInterval(() => {
      fetchThread(activePartnerId);
      fetchConversations();
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activePartnerId, fetchThread, fetchConversations]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Scroll to bottom when thread changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activePartnerId || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic UI
    const optimistic: Message = {
      id: Date.now(),
      content,
      sender_id: user?.id ?? 0,
      is_mine: true,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setActiveThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev
    );

    try {
      await api.post(`/api/messages/${activePartnerId}`, { content });
      fetchThread(activePartnerId);
      fetchConversations();
    } catch {
      setError("Failed to send message.");
      // Remove optimistic message
      setActiveThread((prev) =>
        prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== optimistic.id) } : prev
      );
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter((c) =>
    c.partner.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Please log in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link
          href={user.is_mentor ? "/mentor" : "/user"}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h1 className="font-bold text-slate-900 text-lg">Messages</h1>
          {conversations.reduce((a, c) => a + c.unread_count, 0) > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {conversations.reduce((a, c) => a + c.unread_count, 0)}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Conversations list */}
        <div
          className={`${
            mobileView === "thread" ? "hidden md:flex" : "flex"
          } md:flex w-full md:w-80 lg:w-96 flex-col bg-white border-r border-slate-200 shrink-0`}
        >
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <MessageCircle className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm font-medium">No conversations yet</p>
                <p className="text-slate-400 text-xs mt-1">
                  Book a session or connect with a mentor to start chatting
                </p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.partner_id}
                  onClick={() => openConversation(conv.partner_id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${
                    activePartnerId === conv.partner_id ? "bg-blue-50 border-blue-100" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar user={conv.partner} />
                    {conv.partner.is_mentor && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${conv.unread_count > 0 ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                        {conv.partner.full_name}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate ${conv.unread_count > 0 ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                        {conv.is_mine && <span className="mr-1">You:</span>}
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 shrink-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    {conv.partner.job_title && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {conv.partner.job_title}{conv.partner.company ? ` @ ${conv.partner.company}` : ""}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread panel */}
        <div
          className={`${
            mobileView === "list" ? "hidden md:flex" : "flex"
          } flex-1 flex-col overflow-hidden`}
        >
          {activeThread ? (
            <>
              {/* Thread header */}
              <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
                {/* Mobile back */}
                <button
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                  onClick={() => setMobileView("list")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <Avatar user={activeThread.partner} />
                  {activeThread.partner.is_mentor && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{activeThread.partner.full_name}</p>
                  <p className="text-xs text-slate-400">
                    {activeThread.partner.is_mentor ? "Mentor" : "Learner"}
                    {activeThread.partner.job_title ? ` · ${activeThread.partner.job_title}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50">
                {loadingThread ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                ) : activeThread.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <MessageCircle className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm">No messages yet</p>
                    <p className="text-slate-400 text-xs mt-1">Say hello to {activeThread.partner.full_name}!</p>
                  </div>
                ) : (
                  <>
                    {activeThread.messages.map((msg, i) => {
                      const prev = activeThread.messages[i - 1];
                      const showDate =
                        !prev ||
                        new Date(msg.created_at).toDateString() !==
                          new Date(prev.created_at).toDateString();

                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-slate-200" />
                              <span className="text-xs text-slate-400 font-medium">
                                {new Date(msg.created_at).toLocaleDateString([], {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <div className="flex-1 h-px bg-slate-200" />
                            </div>
                          )}
                          <AnimatePresence>
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${msg.is_mine ? "justify-end" : "justify-start"}`}
                            >
                              {!msg.is_mine && (
                                <Avatar user={activeThread.partner} size="sm" />
                              )}
                              <div
                                className={`ml-2 max-w-[75%] group ${msg.is_mine ? "items-end" : "items-start"} flex flex-col`}
                              >
                                <div
                                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    msg.is_mine
                                      ? "bg-blue-600 text-white rounded-br-sm"
                                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                                  }`}
                                >
                                  {msg.content}
                                </div>
                                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-slate-400">
                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {msg.is_mine && (
                                    msg.is_read
                                      ? <CheckCheck className="w-3 h-3 text-blue-500" />
                                      : <Check className="w-3 h-3 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between">
                  <p className="text-xs text-red-600">{error}</p>
                  <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={sendMessage}
                className="bg-white border-t border-slate-200 px-4 py-3 flex items-end gap-3 shrink-0"
              >
                <textarea
                  rows={1}
                  placeholder={`Message ${activeThread.partner.full_name}...`}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e as unknown as React.FormEvent);
                    }
                  }}
                  className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 max-h-28 overflow-y-auto"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                <MessageCircle className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Your messages</h2>
              <p className="text-slate-500 text-sm max-w-xs">
                Select a conversation from the left to start chatting, or book a session with a mentor to connect with them.
              </p>
              <Link
                href="/user/recommendations"
                className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Find a Mentor
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
