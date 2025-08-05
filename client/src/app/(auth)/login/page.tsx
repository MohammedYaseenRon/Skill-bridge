"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Logo from '@/components/Logo';
import { GradientButton } from '@/components/ui/gradient-button';
import PageWrapper from '@/components/PageWrapper';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface LoginData {
    email:string,
    password:string
}

const Login: React.FC = () => {  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      
      // Redirect to appropriate dashboard
    } catch (error: any) {

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
                Back to Home
              </Link>
              
              <Logo size="md" />
              <h2 className="mt-6 text-3xl font-bold">Welcome Back</h2>
              <p className="mt-2 text-muted-foreground">
                Sign in to your MentorConnect account
              </p>
            </div>

            {/* Login Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
              />

              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
              />

              <div className="flex items-center justify-between">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Forgot your password?
                </Link>
              </div>

              <GradientButton
                type="submit"
                variant="hero"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </GradientButton>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:text-primary-dark font-medium">
                  Sign up here
                </Link>
              </p>
            </motion.form>

            {/* Demo Credentials */}
            <motion.div
              className="p-4 rounded-lg bg-muted/50 border border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-sm font-medium mb-2">Demo Credentials</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Learner:</strong> learner@demo.com / password123</p>
                <p><strong>Mentor:</strong> mentor@demo.com / password123</p>
              </div>
            </motion.div>
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
            <div className="text-6xl mb-6">💡</div>
            <h3 className="text-2xl font-bold mb-4">
              Continue Your Journey
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Welcome back to your mentorship journey. Connect with your mentors, 
              continue learning, and achieve your professional goals.
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;