
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
import { useEffect, useState, type ReactNode, useCallback } from 'react';
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

// --- Topic Data Management ---

// Define the structure for a topic
interface Topic {
  id: string;
  title: string;
  level: string; // Representative level for the card
  description: string;
}

// Default topics if localStorage is empty
const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'java-programming',
    title: 'Java Programming',
    level: 'Beginner',
    description: 'Learn the fundamentals of Java syntax, object-oriented programming, and core libraries.',
  },
  {
    id: 'intermediate-mathematics',
    title: 'Intermediate Mathematics',
    level: 'Intermediate',
    description: 'Explore calculus concepts like limits, derivatives, integrals, and their applications.',
  },
  {
    id: 'organic-chemistry-principles',
    title: 'Organic Chemistry Principles',
    level: 'Advanced',
    description: 'Delve into the structure, properties, reactions, and synthesis of organic compounds.',
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    level: 'Intermediate',
    description: 'Understand arrays, linked lists, stacks, queues, trees, and graphs.',
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra',
    level: 'Beginner',
    description: 'Introduction to vectors, matrices, systems of linear equations, and eigenvalues.',
  },
  {
    id: 'web-development-basics',
    title: 'Web Development Basics',
    level: 'Beginner',
    description: 'Learn HTML, CSS, and JavaScript fundamentals for building web pages.',
  },
];

const LOCAL_STORAGE_TOPICS_KEY = 'eduai-topics';

// Function to get topics from localStorage
const getTopicsFromStorage = (): Topic[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_TOPICS; // Return default during SSR or if window is unavailable
  }
  try {
    const storedTopics = localStorage.getItem(LOCAL_STORAGE_TOPICS_KEY);
    if (storedTopics) {
      return JSON.parse(storedTopics);
    } else {
      // Initialize localStorage if empty
      localStorage.setItem(LOCAL_STORAGE_TOPICS_KEY, JSON.stringify(DEFAULT_TOPICS));
      return DEFAULT_TOPICS;
    }
  } catch (error) {
    console.error("Error accessing or parsing localStorage for topics:", error);
    return DEFAULT_TOPICS; // Fallback to default on error
  }
};

// --- End Topic Data Management ---


// Helper function to get icon based on topic title
const getTopicIcon = (topicTitle: string): ReactNode => {
  const lowerTopic = topicTitle.toLowerCase();
  if (
    lowerTopic.includes('java') ||
    lowerTopic.includes('programming') ||
    lowerTopic.includes('development') ||
    lowerTopic.includes('data structures') // Added data structures
  ) {
    return <Code className="h-6 w-6 text-accent mr-2" />;
  }
  if (
    lowerTopic.includes('mathematics') ||
    lowerTopic.includes('math') ||
    lowerTopic.includes('algebra') // Added linear algebra
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
  slug // Use slug directly passed from props
}: {
  topic: string;
  level: string;
  description: string;
  slug: string;
}) => {
  return (
    <Link href={`/topics/${slug}`} passHref>
        <Card className="card transition-all hover:scale-103 hover:shadow-lg"> {/* Applied hover effect */}
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
    </Link>
  );
};

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

// Simple SVG for EduAI logo (Book + Brain/Chip) - Keep this as it is
const EduAILogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
    {/* Book */}
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Simplified Brain/Chip */}
    <path d="M12 11V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 13v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Optional connections */}
    <path d="M9.5 7L8 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M14.5 7L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M8 13l1.5 -2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M16 13l-1.5 -2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);


export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]); // State for topics
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const router = useRouter();

  // Function to load topics
  const loadTopics = useCallback(() => {
    setTopicsLoading(true);
    const loadedTopics = getTopicsFromStorage();
    setTopics(loadedTopics);
    setTopicsLoading(false);
  }, []);

  // Authentication check effect
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          setUser({ name: 'User', email: 'user@example.com' });
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
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
       try {
         localStorage.setItem('theme', 'dark');
       } catch (error) {
         console.error("Could not save default theme preference:", error);
       }
    }
  }, []);

  // Theme application effect
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

  // Initial Topic loading effect
  useEffect(() => {
    if (!authLoading && user) {
       loadTopics(); // Load topics after authentication is confirmed
    }
  }, [authLoading, user, loadTopics]);

  // Effect to reload topics if localStorage changes (e.g., after deletion)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_TOPICS_KEY) {
        loadTopics();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadTopics]);


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

  // Filter topics based on search term
  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
        <Link href="/" passHref>
          <div className="flex items-center gap-2 cursor-pointer">
            <EduAILogo />
            <h1 className="text-2xl font-bold hidden sm:block">EduAI</h1>
          </div>
        </Link>
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
          <div className="flex items-center gap-2">
            <Link href="/profile" passHref>
             <Avatar className="cursor-pointer">
               <AvatarImage src={user.imageUrl} alt={user.name} />
               <AvatarFallback>
                 {user.name && user.name !== 'User' ? user.name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
               </AvatarFallback>
             </Avatar>
            </Link>
            <Link href="/profile" passHref>
             <span className="cursor-pointer hover:underline hidden sm:block">{user.name}</span>
            </Link>
             <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
               <LogOut className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </header>
       <section className="p-4 flex-grow">
        <div className="search-container flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
            <input
              type="search"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input flex-1 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent" // Added focus:border-accent
            />
          </div>
          <Link href="/request-topic" passHref className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Request New Topic
            </Button>
          </Link>
        </div>
        <h2 className="text-xl font-semibold mb-4">Explore Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicsLoading ? (
            // Show skeletons based on a fixed number or default topics length
            Array.from({ length: 6 }).map((_, index) => <TopicCardSkeleton key={index} />)
          ) : filteredTopics.length > 0 ? (
             filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic.title}
                  level={topic.level}
                  description={topic.description}
                  slug={topic.id} // Pass the topic id as slug
                />
              ))
          ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                 <p className="empty-state-message">
                    {searchTerm ? `No topics found for "${searchTerm}".` : "No topics available."}
                 </p>
              </div>
          )}
        </div>
       </section>
       <footer className="p-4 mt-auto">
         <p className="footer-text">
           © {new Date().getFullYear()} EduAI. All rights reserved.
         </p>
       </footer>
    </div>
  );
}

    