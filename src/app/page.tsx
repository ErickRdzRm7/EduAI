'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, type ReactNode } from "react";
import { authProviders } from '@/config/auth';
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Code, Calculator, FlaskConical, Brain } from "lucide-react"; // Import correct icon

// Helper function to get icon based on topic
const getTopicIcon = (topic: string): ReactNode => {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('java') || lowerTopic.includes('programming')) {
    return <Code className="h-6 w-6 text-accent mr-2" />;
  }
  if (lowerTopic.includes('mathematics') || lowerTopic.includes('math')) {
    return <Calculator className="h-6 w-6 text-accent mr-2" />;
  }
  if (lowerTopic.includes('chemistry')) {
    return <FlaskConical className="h-6 w-6 text-accent mr-2" />;
  }
  return <Brain className="h-6 w-6 text-accent mr-2" />; // Default icon
};

const TopicCard = ({ topic, level, description }: { topic: string; level: string; description: string }) => (
  <Card className="card"> {/* Use the .card class from globals.css */}
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4"> {/* Adjusted padding */}
      <div className="flex items-center">
        {getTopicIcon(topic)}
        <CardTitle className="topic-card-title">{topic}</CardTitle>
      </div>
      <span className="level-badge">{level}</span>
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-2"> {/* Adjusted padding */}
      <p className="topic-card-description">{description}</p>
    </CardContent>
  </Card>
);

const TopicCardSkeleton = () => (
  <Card className="animate-pulse shadow-md rounded-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
       <div className="flex items-center">
         <Skeleton className="h-6 w-6 mr-2 rounded-full"/> {/* Icon placeholder */}
         <Skeleton className="h-6 w-32"/> {/* Title placeholder */}
       </div>
        <Skeleton className="h-5 w-20 rounded-md"/> {/* Level badge placeholder */}
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-2 space-y-2">
      <Skeleton className="h-4 w-full"/>
      <Skeleton className="h-4 w-5/6"/>
    </CardContent>
  </Card>
);

export default function Home() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setUser({
        name: 'John Doe',
        imageUrl: 'https://picsum.photos/id/237/200/300',
        email: 'john.doe@example.com',
      });
      setLoading(false);
    }, 1500); // Increased loading time for skeleton visibility
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen"> {/* Added min-h-screen */}
      <header className="flex items-center justify-between p-4 bg-secondary rounded-md header-border"> {/* Added header-border class */}
        <h1 className="text-2xl font-bold">EduAI</h1> {/* Consider replacing with a logo */}
        {loading ? (
           <div className="flex items-center gap-2">
             <Skeleton className="h-10 w-10 rounded-full" />
             <Skeleton className="h-5 w-20" />
           </div>
        ) : user ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.imageUrl} alt={user.name}/>
              <AvatarFallback>{user.name ? user.name[0] : 'U'}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </div>
        ) : (
          <div className="flex gap-2"> {/* Added gap for buttons */}
            {authProviders.map((provider) => (
              <Button key={provider.id} onClick={() => alert(`Sign in with ${provider.name}`)} variant="outline" size="sm">
                Sign in with {provider.name}
              </Button>
            ))}
          </div>
        )}
      </header>

      <section className="p-4 flex-grow"> {/* Added flex-grow */}
        <div className="mb-6 relative"> {/* Increased margin bottom and added relative positioning */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent"/> {/* Positioned icon inside */}
          <input
            type="search"
            placeholder="Search topics..."
            className="search-input flex-1 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent" // Added focus:border-accent
          />
        </div>

        <h2 className="text-xl font-semibold mb-4">Explore Topics</h2> {/* Increased margin bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Increased gap */}
          {loading ? (
            <>
              <TopicCardSkeleton/>
              <TopicCardSkeleton/>
              <TopicCardSkeleton/>
              <TopicCardSkeleton/>
              <TopicCardSkeleton/>
              <TopicCardSkeleton/>
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
         {/* Placeholder for empty state or no results */}
         {!loading && (
           <div className="empty-state-message"> {/* Use empty-state-message class */}
             {/* Add message like "No topics found." or "Start exploring!" */}
              Start exploring topics or use the search bar!
           </div>
         )}
      </section>

      <footer className="p-4 mt-auto"> {/* Added mt-auto to push footer down */}
        <p className="footer-text"> {/* Use footer-text class */}
          © {new Date().getFullYear()} EduAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
