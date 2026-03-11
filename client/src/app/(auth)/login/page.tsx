"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, Lock, CheckCircle2, Users, Star, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const FEATURES = [
  { icon: Users, text: "Access 18,000+ verified mentors" },
  { icon: Zap, text: "AI-powered matching in seconds" },
  { icon: Star, text: "95% learner satisfaction rate" },
  { icon: TrendingUp, text: "Average 3Ã— faster skill growth" },
];

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const result = await login({ email: formData.email, password: formData.password });
      router.push(result.user.is_mentor ? '/mentor' : '/user');
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* â”€â”€ Left panel: dark brand â”€â”€ */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl -translate-x-24 -translate-y-24 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl translate-x-24 translate-y-24 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Logo size="md" />
        </div>

        {/* Center content */}
        <motion.div className="relative z-10 space-y-8"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Accelerate your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">career growth</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Connect with world-class mentors. Get personalised guidance. Achieve goals faster.
            </p>
          </div>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Testimonial */}
        <motion.div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "SkillBridge matched me with a mentor at Google in 24 hours. Six months later I had my dream offer."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">S</div>
            <div>
              <p className="text-white text-xs font-semibold">Samar K.</p>
              <p className="text-slate-500 text-xs">Software Engineer, Google</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* â”€â”€ Right panel: form â”€â”€ */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <motion.div className="w-full max-w-md"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-2">Sign in to continue your mentorship journey</p>
          </div>

          {/* Error banner */}
          {errors.general && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
              <span className="mt-0.5">âš </span> {errors.general}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input id="email" name="email" type="email" autoComplete="email"
                  value={formData.email} onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl border text-sm bg-slate-50 focus:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
              </div>
              {errors.email && <p className="text-red-600 text-xs">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  value={formData.password} onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full h-12 pl-10 pr-12 rounded-xl border text-sm bg-slate-50 focus:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all duration-200 mt-2">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing inâ€¦</> : 'Sign in to SkillBridge'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">New here?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Sign up CTA */}
          <Link href="/register"
            className="flex items-center justify-center w-full h-12 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-sm transition-all duration-200 gap-2">
            Create a free account
          </Link>

          <p className="text-center text-xs text-slate-400 mt-6">
            By continuing you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600">Terms</a> and{' '}
            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
