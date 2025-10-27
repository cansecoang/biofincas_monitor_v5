'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';


function LoginForm() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get('from') || '/';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      router.push(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left branding panel */}
      <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-b from-blue-500 to-blue-900 items-center justify-center relative">
        <div className="absolute left-0 bottom-0 w-full h-full overflow-hidden pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 bottom-0">
            <circle cx="500" cy="600" r="300" fill="rgba(255,255,255,0.04)" />
            <circle cx="400" cy="500" r="200" fill="rgba(255,255,255,0.06)" />
          </svg>
        </div>
        <div className="z-10 flex flex-col items-start px-16">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Biofincas</h1>
          <p className="text-lg text-blue-100 mb-6">Monitoring & Performance Dashboard</p>
         
        </div>
      </div>

      {/* Right login form panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white min-h-screen">
        <div className="w-full max-w-md px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Login</h2>
          <p className="text-gray-600 mb-8">Hola! Welcome Back</p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-full border border-gray-200 py-2 pl-12 pr-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base bg-gray-50"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.75 1.707l-7.5 6.75a2.25 2.25 0 01-3 0l-7.5-6.75A2.25 2.25 0 013 6.993V6.75"/></svg>
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-full border border-gray-200 py-2 pl-12 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base bg-gray-50"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.125A4.125 4.125 0 008.25 7.125V10.5m8.25 0a2.25 2.25 0 012.25 2.25v3.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-3.75a2.25 2.25 0 012.25-2.25m8.25 0h-8.25"/></svg>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                  tabIndex={-1}
                  aria-label="Show password"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
