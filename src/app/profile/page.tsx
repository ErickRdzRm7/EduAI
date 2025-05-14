
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Moon, Sun, User as UserIcon, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
  const { toast } = useToast();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const storedName = localStorage.getItem('userName') || 'User';
        const storedEmail = localStorage.getItem('userEmail') || 'user@example.com';
        const storedImageUrl = localStorage.getItem('userImageUrl') || undefined;

        if (!isAuthenticated) {
          router.push('/login');
        } else {
          const fetchedUser: User = {
            name: storedName,
            email: storedEmail,
            imageUrl: storedImageUrl,
          };
          setUser(fetchedUser);
          setEditName(fetchedUser.name);
          setEditEmail(fetchedUser.email || '');
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

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') as 'light' | 'dark' | null : 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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


  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []); // setTheme is stable

  const handleEditToggle = useCallback(() => {
    if (!isEditing && user) {
      setEditName(user.name);
      setEditEmail(user.email || '');
    }
    setIsEditing(!isEditing);
  }, [isEditing, user]); // Dependencies: isEditing, user, setEditName, setEditEmail, setIsEditing (stable)

  const handleSaveChanges = useCallback(() => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email,
    };

    try {
      localStorage.setItem('userName', updatedUser.name);
      // localStorage.setItem('userEmail', updatedUser.email || '');
      setUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error("Error saving profile to localStorage:", error);
      toast({
        title: "Error Saving Profile",
        description: "Could not save profile changes. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, editName, editEmail, toast]); // Dependencies: user, editName, editEmail, setUser, setIsEditing, toast

  const handleCancelEdit = useCallback(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email || '');
    }
    setIsEditing(false);
  }, [user]); // Dependencies: user, setEditName, setEditEmail, setIsEditing


  const handleDeleteAccount = useCallback(() => {
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userImageUrl');
      // Consider also deleting all topic and progress data associated with the user
      // This would require iterating through localStorage keys or having a master list.
      // For simplicity, this example only removes core auth/user data.

      toast({
        title: "Account Deleted",
        description: "Your account information has been removed from this browser.",
        variant: "destructive",
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (error) {
      console.error("Error removing items from localStorage:", error);
      toast({
        title: "Error Deleting Account",
        description: "Could not remove account data. Please try again.",
        variant: "destructive",
      });
    } finally {
        setShowDeleteConfirmation(false);
    }
  }, [toast, router]); // Dependencies: toast, router, setShowDeleteConfirmation


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
    <TooltipProvider>
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
              <CardTitle className="text-2xl">{isEditing ? 'Editing Profile' : user.name}</CardTitle>
              <CardDescription>{user.email || 'No email provided'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Information</h3>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={isEditing ? editName : user.name}
                    onChange={(e) => isEditing && setEditName(e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "disabled:cursor-default disabled:opacity-100" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? editEmail : user.email || ''}
                    onChange={(e) => isEditing && setEditEmail(e.target.value)}
                    disabled // Keep email disabled for now, even in edit mode
                    className={"disabled:cursor-default disabled:opacity-100"}
                    />
                </div>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button variant="outline" onClick={handleEditToggle}>Edit Profile</Button>
                    ) : (
                        <>
                            <Button onClick={handleSaveChanges}>
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                            <Button variant="outline" onClick={handleCancelEdit}>
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        </>
                    )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Management</h3>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0}>
                            <Button variant="outline" disabled style={{ pointerEvents: 'none' }}>
                                Change Password (N/A for Social Login)
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Password changes are managed by your social provider (Google, Microsoft, etc.).</p>
                    </TooltipContent>
                </Tooltip>

                 <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account data
                          stored in this browser. You will be logged out.
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setShowDeleteConfirmation(false)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                          Delete Account
                      </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
                  </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="p-4 mt-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EduAI. All rights reserved.
        </footer>
      </div>
    </TooltipProvider>
  );
}
