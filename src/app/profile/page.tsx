
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Moon, Sun, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Mock user data structure - Ideally fetched from auth context/API
interface User {
  name: string;
  email?: string;
  imageUrl?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const router = useRouter();

  // Authentication and User Data Fetching
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          // Simulate fetching user data - replace with actual fetch
          setUser({ name: 'User', email: 'user@example.com', imageUrl: undefined });
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

   // Theme loading effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as
      | 'light'
      | 'dark'
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
      // RootLayout handles initial class application via script
    }
    // If no theme is saved, the 'dark' state default is already set
  }, []);

  // Theme application effect - applies class and saves to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure this runs only on the client
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.error("Could not save theme preference:", error);
      }
    }
  }, [theme]);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
        <header className="flex items-center justify-between flex-wrap gap-4 p-4 bg-secondary rounded-md header-border">
           <div className="flex items-center gap-4">
             <Skeleton className="h-8 w-8 rounded-md" />
             <Skeleton className="h-8 w-32 rounded-md" />
           </div>
           <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        <section className="p-4 max-w-2xl mx-auto flex-grow w-full">
            <Card>
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2 rounded-md"/>
                    <Skeleton className="h-4 w-48 rounded-md"/>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-36 mb-4 rounded-md"/>
                         <div className="grid gap-2">
                             <Skeleton className="h-4 w-12 rounded-md"/>
                             <Skeleton className="h-10 w-full rounded-md"/>
                         </div>
                         <div className="grid gap-2">
                             <Skeleton className="h-4 w-12 rounded-md"/>
                             <Skeleton className="h-10 w-full rounded-md"/>
                         </div>
                         <Skeleton className="h-10 w-36 rounded-md"/>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-48 mb-4 rounded-md"/>
                        <Skeleton className="h-10 w-40 rounded-md"/>
                        <Skeleton className="h-10 w-40 rounded-md"/>
                    </div>
                </CardContent>
            </Card>
        </section>
         <footer className="p-4 mt-auto text-center">
           <Skeleton className="h-4 w-1/2 mx-auto rounded-md"/>
         </footer>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
      <header className="flex items-center justify-between flex-wrap gap-y-4 p-4 bg-secondary rounded-md header-border">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" passHref>
            <Button variant="outline" size="icon" aria-label="Go back home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Your Profile</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </header>

      <section className="p-4 max-w-2xl mx-auto flex-grow w-full">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.imageUrl} alt={user.name} />
              <AvatarFallback className="text-4xl">
                 {user.name && user.name !== 'User' ? user.name[0].toUpperCase() : <UserIcon className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>{user.email || 'No email provided'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />

            {/* Profile Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={user.name} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
              </div>
              {/* Add more fields as needed, e.g., profile picture upload */}
              <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
            </div>

            <Separator />

            {/* Account Management Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Management</h3>
              <Button variant="outline" disabled>Change Password (Coming Soon)</Button>
              {/* Add options for connected accounts if using multiple SSO */}
              <Button variant="destructive" disabled>Delete Account (Coming Soon)</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="p-4 mt-auto text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EduAI. All rights reserved.
      </footer>
    </div>
  );
}
