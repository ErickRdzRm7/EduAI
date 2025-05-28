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

  const handleSaveChanges = useCallback(async () => {
    if (!user) return;

    const updatedUserLocal: User = {
      ...user,
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email,
    };

    try {
      const token = localStorage.getItem('authToken'); // Assuming you store the token as 'authToken'
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile updated on server:", data);
        setUser(updatedUserLocal); // Update local state
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: data.msg || "Your profile information has been saved.",
        });
      } else {
        const errorData = await response.json();
        console.error("Error updating profile:", errorData);
        toast({
          title: "Error Updating Profile",
          description: errorData.msg || "Failed to update profile on the server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server to update profile.",
        variant: "destructive",
      });
    }
  }, [user, editName, editEmail, toast]);

  const handleCancelEdit = useCallback(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email || '');
    }
    setIsEditing(false);
  }, [user]);

  const handleDeleteAccount = useCallback(() => {
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userImageUrl');

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
  }, [toast, router]);

  if (authLoading || !user) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
        {/* ... (skeleton loading UI) ... */}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
        {/* ... (header and navigation) ... */}

        <section className="p-4 max-w-2xl mx-auto flex-grow w-full">
          <Card>
            {/* ... (card header with avatar and title) ... */}
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
            </CardContent>
          </Card>
        </section>

        {/* ... (footer) ... */}
      </div>
    </TooltipProvider>
  );
}