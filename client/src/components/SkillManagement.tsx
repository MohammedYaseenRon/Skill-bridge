"use client";

import React, { useState } from "react";
import { Plus, X, ChevronDown, ChevronUp, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-blue-50 text-blue-700 border-blue-200",
  Advanced:     "bg-violet-50 text-violet-700 border-violet-200",
  Expert:       "bg-amber-50 text-amber-700 border-amber-200",
};

const POPULAR_SKILLS = [
  "Python", "JavaScript", "React", "Node.js", "TypeScript", "SQL",
  "Machine Learning", "Data Analysis", "UI/UX Design", "Product Management",
  "AWS", "Docker", "Git", "REST APIs", "GraphQL", "Vue.js",
];

interface SkillManagementProps {
  currentSkills?: string;        // comma-separated
  skillsInterested?: string;     // comma-separated
  onSave?: (data: { current_skills: string; skills_interested: string }) => void;
}

export default function SkillManagement({ currentSkills = "", skillsInterested = "", onSave }: SkillManagementProps) {
  const parse = (s: string) => s.split(",").map(x => x.trim()).filter(Boolean);

  const [mySkills, setMySkills] = useState<string[]>(parse(currentSkills));
  const [wantSkills, setWantSkills] = useState<string[]>(parse(skillsInterested));
  const [newCurrent, setNewCurrent] = useState("");
  const [newWant, setNewWant] = useState("");
  const [showPopular, setShowPopular] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addSkill = (list: string[], setList: (s: string[]) => void, val: string) => {
    const v = val.trim();
    if (!v || list.map(s => s.toLowerCase()).includes(v.toLowerCase())) return;
    setList([...list, v]);
    setSaved(false);
  };

  const removeSkill = (list: string[], setList: (s: string[]) => void, idx: number) => {
    setList(list.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        current_skills: mySkills.join(", "),
        skills_interested: wantSkills.join(", "),
      };
      await api.put("/api/users/me", payload);
      onSave?.(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent — parent can handle
    } finally {
      setIsSaving(false);
    }
  };

  const SkillTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm">
      {label}
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-700 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Current Skills */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><BookOpen className="h-4 w-4" /></div>
          <h3 className="font-semibold text-slate-900">My Current Skills</h3>
          <Badge className="ml-auto bg-slate-100 text-slate-600 border-0">{mySkills.length}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem]">
          {mySkills.length === 0
            ? <p className="text-sm text-slate-400">Add skills you already have…</p>
            : mySkills.map((s, i) => <SkillTag key={i} label={s} onRemove={() => removeSkill(mySkills, setMySkills, i)} />)
          }
        </div>

        <div className="flex gap-2">
          <input value={newCurrent} onChange={e => setNewCurrent(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { addSkill(mySkills, setMySkills, newCurrent); setNewCurrent(""); } }}
            placeholder="e.g. Python, React, SQL…"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          <Button size="sm" onClick={() => { addSkill(mySkills, setMySkills, newCurrent); setNewCurrent(""); }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Skills I Want to Learn */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Target className="h-4 w-4" /></div>
          <h3 className="font-semibold text-slate-900">Skills I Want to Learn</h3>
          <Badge className="ml-auto bg-slate-100 text-slate-600 border-0">{wantSkills.length}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem]">
          {wantSkills.length === 0
            ? <p className="text-sm text-slate-400">Add skills you want to learn…</p>
            : wantSkills.map((s, i) => <SkillTag key={i} label={s} onRemove={() => removeSkill(wantSkills, setWantSkills, i)} />)
          }
        </div>

        <div className="flex gap-2">
          <input value={newWant} onChange={e => setNewWant(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { addSkill(wantSkills, setWantSkills, newWant); setNewWant(""); } }}
            placeholder="e.g. Machine Learning, Docker…"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          <Button size="sm" onClick={() => { addSkill(wantSkills, setWantSkills, newWant); setNewWant(""); }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Popular skills quick-add */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <button className="flex items-center gap-2 w-full text-left" onClick={() => setShowPopular(v => !v)}>
          <span className="text-sm font-semibold text-slate-700">Popular skills to add</span>
          {showPopular ? <ChevronUp className="h-4 w-4 text-slate-400 ml-auto" /> : <ChevronDown className="h-4 w-4 text-slate-400 ml-auto" />}
        </button>
        {showPopular && (
          <div className="flex flex-wrap gap-2 mt-3">
            {POPULAR_SKILLS.map(s => {
              const inCurrent = mySkills.map(x => x.toLowerCase()).includes(s.toLowerCase());
              const inWant = wantSkills.map(x => x.toLowerCase()).includes(s.toLowerCase());
              return (
                <button key={s} onClick={() => {
                  if (!inCurrent) addSkill(mySkills, setMySkills, s);
                  else if (!inWant) addSkill(wantSkills, setWantSkills, s);
                }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    inCurrent ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default" :
                    inWant ? "bg-blue-50 text-blue-700 border-blue-200 cursor-default" :
                    "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}>
                  {s}{inCurrent ? " ✓" : inWant ? " →" : ""}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Save */}
      <Button onClick={handleSave} disabled={isSaving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11">
        {isSaving ? "Saving…" : saved ? "✓ Saved!" : "Save Skills"}
      </Button>
    </div>
  );
}
