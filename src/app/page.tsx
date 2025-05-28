
'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Code,
  Calculator,
  FlaskConical,
  Brain,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';

// --- Topic Data Structure (Summary derived from Detail) ---

interface TopicSummary {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
}

// Detail structure needed for deriving summaries
interface TopicDetail {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
  content: Record<string, string[]>;
}

const LOCAL_STORAGE_DETAILS_KEY = 'eduai-topic-details';
const LOCAL_STORAGE_DELETED_TOPICS_KEY = 'eduai-deleted-topics';

const getTopicDetailsFromStorage = (): Record<string, TopicDetail> => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const storedDetails = localStorage.getItem(LOCAL_STORAGE_DETAILS_KEY);
    const details = storedDetails ? JSON.parse(storedDetails) : {};

    const deletedTopicIdsString = localStorage.getItem(LOCAL_STORAGE_DELETED_TOPICS_KEY);
    if (deletedTopicIdsString) {
      const deletedTopicIds: string[] = JSON.parse(deletedTopicIdsString);
      for (const id of deletedTopicIds) {
        delete details[id];
      }
      // Persist changes after processing deletions if any occurred
      if (deletedTopicIds.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_DETAILS_KEY, JSON.stringify(details));
        // It's generally better to clear the deleted topics key only after successfully updating the main details.
        // However, if this process is frequent, consider a more robust sync mechanism.
        localStorage.removeItem(LOCAL_STORAGE_DELETED_TOPICS_KEY);
      }
    }
    return details;
  } catch (error) {
    console.error("Error accessing or parsing localStorage for topic details:", error);
    return {};
  }
};

const deriveTopicsSummaryFromDetails = (details: Record<string, TopicDetail>): TopicSummary[] => {
    return Object.values(details).map(detail => ({
        id: detail.id,
        title: detail.title,
        level: detail.level,
        description: detail.description ?? 'No description provided.',
    }));
};

const TopicIcon = React.memo(({ title }: { title: string }) => {
  const lowerTopic = title.toLowerCase();
  if (
    lowerTopic.includes('java') ||
    lowerTopic.includes('programming') ||
    lowerTopic.includes('development') ||
    lowerTopic.includes('data structures')
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
  return <Brain className="h-6 w-6 text-accent mr-2" />;
});
TopicIcon.displayName = 'TopicIcon';


const TopicCard = React.memo(({
  topic,
  level,
  description,
  slug
}: {
  topic: string;
  level: string;
  description: string;
  slug: string;
}) => {
  return (
    <Link href={`/topics/${slug}`} passHref>
        <Card className="card transition-all hover:scale-103 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <div className="flex items-center">
            <TopicIcon title={topic} />
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
});
TopicCard.displayName = 'TopicCard';

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

interface User {
  name: string;
  imageUrl?: string;
  email?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authProcessed, setAuthProcessed] = useState(false); // Tracks if initial auth check is complete
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();

  const loadTopics = useCallback(() => {
    setTopicsLoading(true);
    const details = getTopicDetailsFromStorage();
    const loadedSummaries = deriveTopicsSummaryFromDetails(details);
    setTopics(loadedSummaries);
    setTopicsLoading(false);
    console.log('Loaded topic summaries derived from details.');
  }, []);

  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        router.replace('/login'); // Use replace to not add to history if redirecting from '/'
      } else {
        const storedName = localStorage.getItem('userName') || 'User';
        const storedEmail = localStorage.getItem('userEmail') || 'user@example.com';
        const storedImageUrl = localStorage.getItem('userImageUrl') || undefined;
        setUser({ name: storedName, email: storedEmail, imageUrl: storedImageUrl });
      }
    } catch (error) {
      console.error("Error accessing localStorage during auth check:", error);
      router.replace('/login'); // Fallback to login on error
    } finally {
      setAuthProcessed(true); // Mark auth check as complete regardless of outcome
    }
  }, [router]);

  useEffect(() => {
    let savedTheme: 'light' | 'dark' = 'dark';
    if (typeof window !== 'undefined') {
      try {
        const themeFromStorage = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (themeFromStorage) {
          savedTheme = themeFromStorage;
        }
      } catch (error) {
        console.error("Could not access localStorage for theme:", error);
      }
    }
    setTheme(savedTheme);
    if (typeof window !== 'undefined') {
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
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

  useEffect(() => {
    // Load topics only if user is authenticated and auth has been processed
    if (authProcessed && user) {
       loadTopics();
    }
  }, [authProcessed, user, loadTopics]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_DETAILS_KEY || event.key === LOCAL_STORAGE_DELETED_TOPICS_KEY) {
        console.log('Detected storage change for topic details or deletions. Reloading summaries...');
        loadTopics();
      }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorageChange);
        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
    }
  }, [loadTopics]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleSignOut = useCallback(() => {
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userImageUrl');
    } catch (error) {
        console.error("Error accessing localStorage during sign out:", error);
    }
    setUser(null);
    setAuthProcessed(false); // Reset auth processed state, so next navigation to / will re-check
    router.push('/login');
  }, [router]);


  const filteredTopics = useMemo(() => {
    if (topicsLoading) return []; // Keep this for while topics are actively loading
    return topics.filter(topic =>
      topic.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (topic.description && topic.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [topics, debouncedSearchTerm, topicsLoading]);


  if (!authProcessed) {
    // Show a minimal loader while initial authentication is being checked.
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // If auth has been processed and there's still no user,
    // it means the redirect to /login should have occurred or is in progress.
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
         <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authProcessed is true and user is not null, render the main home page content
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
       <AppHeader
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSignOut={handleSignOut}
        />
       <section className="p-4 flex-grow">
        <div className="search-container flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
            <input
              type="search"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input flex-1 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent"
            />
          </div>
          <Link href="/request-topic" className="w-full sm:w-auto">
  <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2">
    <Plus className="mr-2 h-4 w-4" /> Request New Topic
  </button>
</Link>
        </div>
        <h2 className="text-xl font-semibold mb-4">Explore Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicsLoading ? ( // This skeleton is for when topics are being loaded, after user is confirmed
            Array.from({ length: 3 }).map((_, index) => <TopicCardSkeleton key={index} />)
          ) : filteredTopics.length > 0 ? (
             filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic.title}
                  level={topic.level}
                  description={topic.description}
                  slug={topic.id}
                />
              ))
          ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                 <p className="empty-state-message">
                    {debouncedSearchTerm ? `No topics found for "${debouncedSearchTerm}". Try requesting one!` : "No topics created yet. Request one to get started!"}
                 </p>
              </div>
          )}
        </div>
       </section>
       <AppFooter />
    </div>
  );
}
