"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { GradientButton } from '@/components/ui/gradient-button';
import PageWrapper from '@/components/PageWrapper';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { RegisterData } from '@/types';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import UserTypeToggle from '@/components/UserTypeToggle';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    profile_picture_url: '',
    bio: '',
    location: '',
    is_mentor: false,
    // Mentor fields
    skills: '',
    expertise: '',
    experience_years: 0,
    languages_spoken: '',
    availability: '',
    hourly_rate: 0,
    linkedin_url: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    // Mentor-specific validation
    if (formData.is_mentor) {
      if (!formData.skills?.trim()) newErrors.skills = 'Skills are required for mentors';
      if (!formData.expertise?.trim()) newErrors.expertise = 'Expertise is required for mentors';
      if (!formData.experience_years || formData.experience_years < 1) {
        newErrors.experience_years = 'Experience years must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.detail || "Registration failed" });
      } else {
        router.push("/login");
      }
    } catch (error) {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back href Home
              </Link>
              
              <Logo size="md" />
              <h2 className="mt-6 text-3xl font-bold">Create Your Account</h2>
              <p className="mt-2 text-muted-foreground">
                Join our community and start your menhrefrship journey
              </p>
            </div>

            {/* User Type Toggle */}
            <UserTypeToggle
              isMentor={formData.is_mentor}
              onChange={(isMentor) => setFormData(prev => ({ ...prev, is_mentor: isMentor }))}
            />

            {/* Registration Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                
                <label className="block text-sm font-medium mb-1" htmlFor="full_name">Full Name</label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />

                <label className="block text-sm font-medium mb-1" htmlFor="email">Email Address</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />

                <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create a strong password"
                />

                <label className="block text-sm font-medium mb-1" htmlFor="phone_number">Phone Number</label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number || ''}
                  onChange={handleInputChange}
                  placeholder="Your phone number (optional)"
                />

                <label className="block text-sm font-medium mb-1" htmlFor="location">Location</label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  placeholder="City, Country (optional)"
                />

                <label className="block text-sm font-medium mb-1" htmlFor="bio">Bio</label>
                <Input
                  id="bio"
                  name="bio"
                  type="textarea"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself (optional)"
                />
              </div>

              {/* Mentor-specific fields */}
              {formData.is_mentor && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-black">Mentor Information</h3>
                  
                  <label className="block text-sm font-medium mb-1" htmlFor="skills">Skills</label>
                  <Input
                    id="skills"
                    name="skills"
                    value={formData.skills || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., JavaScript, React, Python, UI/UX Design"
                  />

                  <label className="block text-sm font-medium mb-1" htmlFor="expertise">Expertise</label>
                  <Input
                    id="expertise"
                    name="expertise"
                    value={formData.expertise || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Your area of expertise"
                  />

                  <label className="block text-sm font-medium mb-1" htmlFor="experience_years">Experience Years</label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    value={formData.experience_years || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Number of years"
                  />

                  <label className="block text-sm font-medium mb-1" htmlFor="languages_spoken">Languages Spoken</label>
                  <Input
                    id="languages_spoken"
                    name="languages_spoken"
                    value={formData.languages_spoken || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., English, Spanish, French"
                  />

                  <label className="block text-sm font-medium mb-1" htmlFor="availability">Availability</label>
                  <Input
                    id="availability"
                    name="availability"
                    value={formData.availability || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Weekdays 6-8 PM EST"
                  />

                  <label className="block text-sm font-medium mb-1" htmlFor="hourly_rate">Hourly Rate</label>
                  <Input
                    id="hourly_rate"
                    name="hourly_rate"
                    type="number"
                    value={formData.hourly_rate || ''}
                    onChange={handleInputChange}
                    placeholder="Optional - leave 0 for free mentoring"
                  />

                  <label className="block text-sm font-medium mb-1" htmlFor="linkedin_url">LinkedIn URL</label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    value={formData.linkedin_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </motion.div>
              )}

              <Button
               
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                  Sign in here
                </Link>
              </p>
            </motion.form>
          </motion.div>
        </div>

        {/* Right side - Visual */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 items-center justify-center p-12">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold mb-4">
              {formData.is_mentor ? 'Share Your Expertise' : 'Accelerate Your Growth'}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {formData.is_mentor 
                ? 'Help others succeed while building meaningful professional relationships and growing your network.'
                : 'Connect with industry experts, learn new skills, and achieve your career goals faster than ever.'
              }
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Register;