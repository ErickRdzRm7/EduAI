
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Code,
  Calculator,
  FlaskConical,
  Brain,
  Plus,
  Moon,
  Sun,
  LogOut, // Import LogOut icon
  User as UserIcon, // Import User icon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

// Helper function to get icon based on topic
const getTopicIcon = (topic: string): ReactNode => {
  const lowerTopic = topic.toLowerCase();
  if (
    lowerTopic.includes('java') ||
    lowerTopic.includes('programming') ||
    lowerTopic.includes('development')
  ) {
    return <Code className="h-6 w-6 text-accent mr-2" />;
  }
  if (
    lowerTopic.includes('mathematics') ||
    lowerTopic.includes('math') ||
    lowerTopic.includes('algebra')
  ) {
    return <Calculator className="h-6 w-6 text-accent mr-2" />;
  }
  if (lowerTopic.includes('chemistry')) {
    return <FlaskConical className="h-6 w-6 text-accent mr-2" />;
  }
  return <Brain className="h-6 w-6 text-accent mr-2" />; // Default icon
};

const TopicCard = ({
  topic,
  level,
  description,
}: {
  topic: string;
  level: string;
  description: string;
}) => (
  <Card className="card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
      <div className="flex items-center">
        {getTopicIcon(topic)}
        <CardTitle className="topic-card-title">{topic}</CardTitle>
      </div>
      <span className="level-badge">{level}</span>
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-2">
      <p className="topic-card-description">{description}</p>
    </CardContent>
  </Card>
);

const TopicCardSkeleton = () => (
  <Card className="animate-pulse shadow-md rounded-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
      <div className="flex items-center">
        <Skeleton className="h-6 w-6 mr-2 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-5 w-20 rounded-md" />
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-2 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
  </Card>
);

// Mock user data structure
interface User {
  name: string;
  imageUrl?: string; // Optional image URL
  email?: string; // Optional email
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const router = useRouter();

  // Authentication check effect
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          // Simulate fetching user data
          setUser({ name: 'User', email: 'user@example.com' }); // Basic user with email
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
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Theme application effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Topic loading simulation effect
  useEffect(() => {
    if (!authLoading && user) {
      setTimeout(() => {
        setTopicsLoading(false);
      }, 1000);
    }
  }, [authLoading, user]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('isAuthenticated');
    } catch (error) {
        console.error("Error accessing localStorage:", error);
    }
    setUser(null);
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!user) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
         <p>Redirecting to login...</p>
      </div>
     );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
      <header className="flex items-center justify-between p-4 bg-secondary rounded-md header-border">
        <h1 className="text-2xl font-bold">EduAI</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          {/* User info and Sign Out Button */}
          <div className="flex items-center gap-2">
            <Link href="/profile" passHref>
             <Avatar className="cursor-pointer">
               <AvatarImage src={user.imageUrl} alt={user.name} />
               <AvatarFallback>
                 {/* Use UserIcon if name is 'User' or no name */}
                 {user.name && user.name !== 'User' ? user.name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
               </AvatarFallback>
             </Avatar>
            </Link>
            <Link href="/profile" passHref>
             <span className="cursor-pointer hover:underline">{user.name}</span>
            </Link>
             <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
               <LogOut className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </header>
      <section className="p-4 flex-grow">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
            <input
              type="search"
              placeholder="Search topics..."
              className="search-input flex-1 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent" // Added focus:border-accent
            />
          </div>
          <Link href="/request-topic" passHref>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Request New Topic
            </Button>
          </Link>
        </div>
        <h2 className="text-xl font-semibold mb-4">Explore Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicsLoading ? (
            <>
              <TopicCardSkeleton />
              <TopicCardSkeleton />
              <TopicCardSkeleton />
              <TopicCardSkeleton />
              <TopicCardSkeleton />
              <TopicCardSkeleton />
            </>
          ) : (
            <>
              <TopicCard
                topic="Java Programming"
                level="Beginner"
                description="Learn the fundamentals of Java syntax, object-oriented programming, and core libraries."
              />
              <TopicCard
                topic="Intermediate Mathematics"
                level="Intermediate"
                description="Explore calculus concepts like limits, derivatives, integrals, and their applications."
              />
              <TopicCard
                topic="Organic Chemistry Principles"
                level="Advanced"
                description="Delve into the structure, properties, reactions, and synthesis of organic compounds."
              />
              <TopicCard
                topic="Data Structures"
                level="Intermediate"
                description="Understand arrays, linked lists, stacks, queues, trees, and graphs."
              />
              <TopicCard
                topic="Linear Algebra"
                level="Beginner"
                description="Introduction to vectors, matrices, systems of linear equations, and eigenvalues."
              />
              <TopicCard
                topic="Web Development Basics"
                level="Beginner"
                description="Learn HTML, CSS, and JavaScript fundamentals for building web pages."
              />
            </>
          )}
        </div>
        {!topicsLoading && (
          <div className="mt-8 text-center text-muted-foreground">
            Start exploring topics or use the search bar!
          </div>
        )}
      </section>
      <footer className="p-4 mt-auto">
        <p className="footer-text text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EduAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
