
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Facebook } from 'lucide-react'; // Assuming Facebook icon is needed
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

// Simple SVG for Microsoft logo (replace with a better one if available)
const MicrosoftLogo = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 10H0V0H10V10Z" fill="#F25022"/>
    <path d="M21 10H11V0H21V10Z" fill="#7FBA00"/>
    <path d="M10 21H0V11H10V21Z" fill="#00A4EF"/>
    <path d="M21 21H11V11H21V21Z" fill="#FFB900"/>
  </svg>
);

// Simple SVG for Google logo (replace with a better one if available)
const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-3.571h-7.217v-8h19.611c.252 1.26.389 2.577.389 3.917z"/>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();

  // Generic sign-in handler that simulates authentication
  const handleSignIn = (provider: string) => {
    console.log(`Attempting to sign in with ${provider}...`);
    // Simulate a successful authentication
    try {
      localStorage.setItem('isAuthenticated', 'true');
      // Add user details to local storage if needed, e.g.,
      // localStorage.setItem('userName', 'Demo User');
      router.push('/'); // Redirect to the main page upon successful "login"
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      alert('Login failed. Could not save authentication status.'); // Inform user
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
       {/* Back button is removed as this is the entry point when not logged in */}
       {/*
       <Link href="/" passHref className="absolute top-4 left-4">
          <Button variant="outline" size="icon" aria-label="Go back home">
              <ArrowLeft className="h-4 w-4" />
          </Button>
       </Link>
       */}
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In to EduAI</CardTitle>
          <CardDescription>
            Choose your preferred provider to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button variant="outline" onClick={() => handleSignIn('Google')} className="w-full">
            <GoogleLogo />
            <span className="ml-2">Sign in with Google</span> {/* Added margin */}
          </Button>
          <Button variant="outline" onClick={() => handleSignIn('Microsoft')} className="w-full">
             <MicrosoftLogo />
             <span className="ml-2">Sign in with Microsoft</span> {/* Added margin */}
          </Button>
          <Button variant="outline" onClick={() => handleSignIn('Facebook')} className="w-full">
            <Facebook className="h-5 w-5" />
            <span className="ml-2">Sign in with Facebook</span> {/* Added margin */}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
