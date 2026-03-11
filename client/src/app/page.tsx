"use client";

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Logo from '@/components/Logo';
import { ArrowRight, Star, Users, Award, MessageCircle, CheckCircle, Zap, Shield, TrendingUp, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / 80);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const Landing: React.FC = () => {
  const router = useRouter();

  const stats = [
    { value: 10000, suffix: "+", label: "Active Mentors" },
    { value: 50000, suffix: "+", label: "Successful Matches" },
    { value: 95, suffix: "%", label: "Satisfaction Rate" },
    { value: 100, suffix: "+", label: "Skills Covered" },
  ];

  const features = [
    { icon: Users, color: "bg-blue-100 text-blue-600", title: "Expert Mentors", description: "Connect with verified industry professionals across tech, design, business and more." },
    { icon: Zap, color: "bg-violet-100 text-violet-600", title: "AI-Powered Matching", description: "Our algorithm finds mentors that perfectly align with your goals, skills and learning style." },
    { icon: MessageCircle, color: "bg-emerald-100 text-emerald-600", title: "Real-time Sessions", description: "Video calls, live chat, and async messaging — all within the platform." },
    { icon: TrendingUp, color: "bg-amber-100 text-amber-600", title: "Track Progress", description: "Set milestones, measure skill growth and celebrate achievements on your journey." },
    { icon: Shield, color: "bg-rose-100 text-rose-600", title: "Trusted & Safe", description: "All mentors are verified. Sessions are logged and reviews are real." },
    { icon: Award, color: "bg-teal-100 text-teal-600", title: "Personalised Path", description: "Get tailored recommendations based on where you are and where you want to go." },
  ];

  const steps = [
    { step: "01", title: "Create your profile", description: "Tell us your goals, current skills and what you want to learn. Takes less than 3 minutes." },
    { step: "02", title: "Get matched instantly", description: "Our AI recommends the best mentors for you based on compatibility scores and availability." },
    { step: "03", title: "Book & start learning", description: "Schedule a session, meet your mentor and start accelerating your growth today." },
  ];

  const testimonials = [
    { name: "Priya Sharma", role: "Software Engineer at Google", avatar: "PS", rating: 5, text: "SkillBridge matched me with a mentor who had the exact experience I needed. Within 3 months I landed my dream role at Google." },
    { name: "Arjun Mehta", role: "Product Designer", avatar: "AM", rating: 5, text: "The AI matching is incredible. My mentor understood my learning style and tailored every session perfectly." },
    { name: "Sarah Chen", role: "Data Scientist", avatar: "SC", rating: 5, text: "I went from knowing basic Python to deploying ML models in production. The structured mentorship made all the difference." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo size="sm" />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-slate-700 font-medium">Sign In</Button>
            <Button onClick={() => router.push('/register')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg font-medium">Get Started Free</Button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-100 rounded-full filter blur-3xl opacity-30 -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap className="h-3.5 w-3.5" /> AI-powered mentor matching
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Find the mentor who<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">unlocks your potential</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with industry experts, get personalised guidance, and accelerate your career with structured 1-on-1 mentorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button onClick={() => router.push('/register')} className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 group">
                Start for free <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" onClick={() => router.push('/login')} className="h-12 px-8 text-base border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 gap-2">
                <Play className="h-4 w-4" /> I'm a mentor
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              {["No credit card required", "Free to get started", "Cancel anytime"].map(t => (
                <div key={t} className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" />{t}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} className="text-center" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1"><AnimatedCounter end={stat.value} suffix={stat.suffix} /></div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 className="text-4xl font-bold text-slate-900 mb-4" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
              Everything you need to grow faster
            </motion.h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Built for serious learners who want real results, not just advice.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-slate-200 transition-all"
                initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}><f.icon className="h-5 w-5" /></div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 className="text-4xl font-bold text-slate-900 mb-4" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
              Up and running in minutes
            </motion.h2>
            <p className="text-lg text-slate-500">Three simple steps to your first mentorship session.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.step} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4">{s.step}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 className="text-4xl font-bold text-slate-900 mb-4" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
              Loved by learners worldwide
            </motion.h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
                initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <div><div className="text-sm font-medium text-slate-900">{t.name}</div><div className="text-xs text-slate-500">{t.role}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-violet-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to accelerate your growth?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Join thousands of learners who found their perfect mentor and transformed their careers.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push('/register')} className="h-12 px-8 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-semibold text-base group">
                Get started free <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" onClick={() => router.push('/login')} className="h-12 px-8 border-white/30 text-white hover:bg-white/10 rounded-xl font-semibold text-base">Sign in</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        {/* Main footer grid */}
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <Logo size="sm" />
              <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xs">
                AI-powered mentorship that connects learners with industry experts to accelerate career growth.
              </p>
              <div className="flex items-center gap-3 mt-6">
                {[
                  { icon: "in", href: "#", label: "LinkedIn" },
                  { icon: "tw", href: "#", label: "Twitter" },
                  { icon: "gh", href: "#", label: "GitHub" },
                ].map(s => (
                  <a key={s.label} href={s.href} aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white transition-all duration-200">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                {["Find a Mentor", "Become a Mentor", "AI Matching", "Skill Assessment", "Session Booking"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                {["Blog", "Community", "Career Guides", "Success Stories", "Help Center"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Stay Updated</h4>
              <p className="text-sm text-slate-400 mb-4">Get weekly mentorship tips and career insights.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="your@email.com"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 min-w-0" />
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                  18,000+ mentors worldwide
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                  No spam, unsubscribe anytime
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2026 SkillBridge, Inc. All rights reserved.</p>
            <div className="flex flex-wrap gap-6 text-xs">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"].map(l => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
