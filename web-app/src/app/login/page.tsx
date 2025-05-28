// /path/to/your/LoginPage.tsx (e.g., app/login/page.tsx)
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Simple SVG for EduAI logo - Remains the same
const EduAILogo = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-primary">
    {/* Book */}
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Simplified Brain/Chip */}
    <path d="M12 11V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 13v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.5 7L8 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M14.5 7L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M8 13l1.5 -2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M16 13l-1.5 -2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // API URL - ideally from environment variables
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5433';

  // Redirect if already authenticated
  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      // You might also want to check if the token exists and is not expired here
      if (isAuthenticated) {
        router.push('/'); // Redirect to home page if already authenticated
      }
    } catch (e) {
      console.error("Error accessing localStorage during auth check:", e);
    }
  }, [router]);


  // Sign-in handler for email/password
  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', data.user.name); // Assuming backend sends user.name
        localStorage.setItem('userEmail', data.user.email); // Assuming backend sends user.email
        // Optionally, store user ID or other non-sensitive info:
        // localStorage.setItem('userId', data.user.id);
        
        router.push('/'); // Redirect to the main page
      } else {
        // Login failed - display error message from backend or a generic one
        setError(data.msg || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError('An error occurred during login. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <EduAILogo />
          <CardTitle className="text-2xl font-bold">Sign In to EduAI</CardTitle>
          <CardDescription>
            Welcome back! Enter your credentials to continue learning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="underline font-semibold hover:text-primary">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}