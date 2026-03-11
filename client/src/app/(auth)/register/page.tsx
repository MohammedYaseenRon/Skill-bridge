"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  Star,
  CheckCircle2,
  Users,
  TrendingUp,
  BookOpen,
  Zap,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { RegisterData } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "@/hooks";

const Register: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = basic info, 2 = role-specific info
  const {
    register: registerUser,
    error: authError,
    isLoading,
    clearError,
  } = useAuth();

  const redirectUser = (userRole: string) => {
    switch (userRole) {
      case "mentor":
        router.push("/mentor");
        break;
      case "learner":
        router.push("/user");
        break;
      default:
        router.push("/");
    }
  };

  const validateForm = (values: RegisterData) => {
    const errors: Record<string, string> = {};

    if (!values.full_name.trim()) errors.full_name = "Full name is required";
    if (!values.email.trim()) errors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(values.email))
      errors.email = "Invalid email format";

    if (!values.password) {
      errors.password = "Password is required";
    } else {
      if (values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      } else if (values.password.length > 128) {
        errors.password = "Password is too long (max 128 characters)";
      } else if (new TextEncoder().encode(values.password).length > 72) {
        errors.password = "Password contains too many special characters";
      } else {
        const hasUpper = /[A-Z]/.test(values.password);
        const hasLower = /[a-z]/.test(values.password);
        const hasDigit = /\d/.test(values.password);
        if (!hasUpper || !hasLower || !hasDigit) {
          errors.password =
            "Password should contain uppercase, lowercase, and numeric characters";
        }
      }
    }

    if (values.is_mentor) {
      if (!values.skills?.trim())
        errors.skills = "Skills are required for mentors";
      if (!values.expertise?.trim())
        errors.expertise = "Expertise is required for mentors";
      if (!values.experience_years || values.experience_years < 1)
        errors.experience_years = "Experience years must be at least 1";
      if (!values.languages_spoken?.trim())
        errors.languages_spoken = "Languages spoken is required for mentors";
    }

    return errors;
  };

  const {
    values: formData,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useForm<RegisterData>({
    initialValues: {
      full_name: "",
      email: "",
      password: "",
      phone_number: "",
      profile_picture_url: "",
      bio: "",
      location: "",
      is_mentor: false,
      learning_goal: "",
      preferred_language: "English",
      time_zone: "",
      learning_style: "",
      experience_level: "",
      availability: "",
      skills_interested: "",
      current_skills: "",
      skills: "",
      expertise: "",
      experience_years: 0,
      languages_spoken: "English",
      mentor_availability: "",
      hourly_rate: 0,
      linkedin_url: "",
      company: "",
      job_title: "",
    },
    validate: validateForm,
    onSubmit: async (data) => {
      try {
        clearError();
        const result = await registerUser(data);
        if (result && result.user) {
          setTimeout(() => redirectUser(result.user.role), 1000);
        } else {
          const role = data.is_mentor ? "mentor" : "learner";
          setTimeout(() => redirectUser(role), 1000);
        }
      } catch (error) {
        console.error("Registration failed:", error);
      }
    },
  });

  const inputClass =
    "w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400";
  const selectClass =
    "w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700";
  const textareaClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";
  const errorClass = "text-xs text-red-500 mt-1";

  const mentorBenefits = [
    { icon: <Users className="w-4 h-4" />, text: "Connect with 50K+ learners globally" },
    { icon: <Star className="w-4 h-4" />, text: "Build your professional reputation" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "Earn up to $150/hr sharing expertise" },
    { icon: <Zap className="w-4 h-4" />, text: "AI-powered learner matching" },
  ];

  const learnerBenefits = [
    { icon: <BookOpen className="w-4 h-4" />, text: "Access to 18,000+ expert mentors" },
    { icon: <Star className="w-4 h-4" />, text: "Personalized learning paths" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "95% learners reach their goals" },
    { icon: <Zap className="w-4 h-4" />, text: "AI skill gap analysis & roadmaps" },
  ];

  const benefits = formData.is_mentor ? mentorBenefits : learnerBenefits;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — decorative */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[45%] flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        {/* background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <div>
            <Logo size="md" />
          </div>

          {/* Role benefits */}
          <div className="mt-14 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={formData.is_mentor ? "mentor" : "learner"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-blue-300 text-xs font-medium">
                    {formData.is_mentor ? "Joining as Mentor" : "Joining as Learner"}
                  </span>
                </div>

                <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
                  {formData.is_mentor
                    ? "Share your expertise with the world"
                    : "Accelerate your career growth"}
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-10">
                  {formData.is_mentor
                    ? "Join thousands of mentors helping learners unlock their potential"
                    : "Learn from top industry professionals and achieve your goals faster"}
                </p>

                <ul className="space-y-4">
                  {benefits.map((b, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 text-slate-300"
                    >
                      <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                        {b.icon}
                      </span>
                      <span className="text-sm">{b.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: "Active Mentors", value: "18K+" },
              { label: "Satisfaction", value: "95%" },
              { label: "Sessions Done", value: "120K+" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex-1 bg-white flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col px-6 sm:px-10 xl:px-16 py-8 max-w-2xl mx-auto w-full">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors ml-auto lg:ml-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Create your account
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="mb-7">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              I want to join as
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setFieldValue("is_mentor", false); clearError(); }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  !formData.is_mentor
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-lg">🎓</span>
                <div className="text-left">
                  <div className="font-semibold">Learner</div>
                  <div className="text-xs font-normal opacity-70">Find a mentor</div>
                </div>
                {!formData.is_mentor && (
                  <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 text-blue-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => { setFieldValue("is_mentor", true); clearError(); }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  formData.is_mentor
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-lg">🧑‍💼</span>
                <div className="text-left">
                  <div className="font-semibold">Mentor</div>
                  <div className="text-xs font-normal opacity-70">Share expertise</div>
                </div>
                {formData.is_mentor && (
                  <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 text-blue-600" />
                )}
              </button>
            </div>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {authError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    step >= s
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? "bg-blue-600" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            ))}
            <span className="ml-2 text-xs text-slate-500">
              Step {step} of 2 — {step === 1 ? "Basic Info" : "Profile Details"}
            </span>
          </div>

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="full_name"
                        type="text"
                        placeholder="Jane Smith"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                    {errors.full_name && <p className={errorClass}>{errors.full_name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${inputClass} pl-10 pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className={errorClass}>{errors.password}</p>}
                  </div>

                  {/* Phone + Location */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Phone (optional)</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="phone_number"
                          type="tel"
                          placeholder="+1 555 0100"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Location (optional)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="location"
                          type="text"
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={handleChange}
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className={labelClass}>Short Bio (optional)</label>
                    <textarea
                      name="bio"
                      rows={3}
                      placeholder="Tell us a bit about yourself..."
                      value={formData.bio}
                      onChange={handleChange}
                      className={textareaClass}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {formData.is_mentor ? (
                    /* ── MENTOR FIELDS ── */
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Job Title</label>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              name="job_title"
                              type="text"
                              placeholder="Senior Engineer"
                              value={formData.job_title}
                              onChange={handleChange}
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Company</label>
                          <input
                            name="company"
                            type="text"
                            placeholder="Acme Corp"
                            value={formData.company}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Skills <span className="text-red-500">*</span></label>
                        <input
                          name="skills"
                          type="text"
                          placeholder="Python, React, Machine Learning (comma-separated)"
                          value={formData.skills}
                          onChange={handleChange}
                          className={inputClass}
                        />
                        {errors.skills && <p className={errorClass}>{errors.skills}</p>}
                      </div>

                      <div>
                        <label className={labelClass}>Area of Expertise <span className="text-red-500">*</span></label>
                        <input
                          name="expertise"
                          type="text"
                          placeholder="Frontend Development, AI/ML"
                          value={formData.expertise}
                          onChange={handleChange}
                          className={inputClass}
                        />
                        {errors.expertise && <p className={errorClass}>{errors.expertise}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Years of Experience <span className="text-red-500">*</span></label>
                          <input
                            name="experience_years"
                            type="number"
                            min="1"
                            placeholder="5"
                            value={formData.experience_years || ""}
                            onChange={handleChange}
                            className={inputClass}
                          />
                          {errors.experience_years && <p className={errorClass}>{errors.experience_years}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Hourly Rate (USD)</label>
                          <input
                            name="hourly_rate"
                            type="number"
                            min="0"
                            placeholder="50"
                            value={formData.hourly_rate || ""}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Languages <span className="text-red-500">*</span></label>
                          <input
                            name="languages_spoken"
                            type="text"
                            placeholder="English, Spanish"
                            value={formData.languages_spoken}
                            onChange={handleChange}
                            className={inputClass}
                          />
                          {errors.languages_spoken && <p className={errorClass}>{errors.languages_spoken}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Availability</label>
                          <select
                            name="mentor_availability"
                            value={formData.mentor_availability}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="">Select...</option>
                            <option value="weekdays">Weekdays</option>
                            <option value="weekends">Weekends</option>
                            <option value="evenings">Evenings</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>LinkedIn URL (optional)</label>
                        <input
                          name="linkedin_url"
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={formData.linkedin_url}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </>
                  ) : (
                    /* ── LEARNER FIELDS ── */
                    <>
                      <div>
                        <label className={labelClass}>Learning Goal</label>
                        <textarea
                          name="learning_goal"
                          rows={2}
                          placeholder="What do you want to achieve? (e.g., become a full-stack developer)"
                          value={formData.learning_goal}
                          onChange={handleChange}
                          className={textareaClass}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Experience Level</label>
                          <select
                            name="experience_level"
                            value={formData.experience_level}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="">Select...</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Learning Style</label>
                          <select
                            name="learning_style"
                            value={formData.learning_style}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="">Select...</option>
                            <option value="visual">Visual</option>
                            <option value="auditory">Auditory</option>
                            <option value="reading">Reading/Writing</option>
                            <option value="kinesthetic">Hands-on</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Skills You're Interested In</label>
                        <input
                          name="skills_interested"
                          type="text"
                          placeholder="React, Python, Data Science (comma-separated)"
                          value={formData.skills_interested}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Current Skills</label>
                        <input
                          name="current_skills"
                          type="text"
                          placeholder="HTML, CSS, JavaScript basics..."
                          value={formData.current_skills}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Availability</label>
                        <select
                          name="availability"
                          value={formData.availability}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          <option value="">Select...</option>
                          <option value="weekdays">Weekdays</option>
                          <option value="weekends">Weekends</option>
                          <option value="evenings">Evenings</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-12 px-5 border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Footer note */}
          <p className="text-xs text-center text-slate-400 mt-8 pb-4">
            By creating an account you agree to our{" "}
            <Link href="#" className="underline hover:text-slate-600">Terms of Service</Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-slate-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
