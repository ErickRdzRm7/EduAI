'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useEffect, useState} from 'react';
import {authProviders} from '@/config/auth';
import {Skeleton} from "@/components/ui/skeleton";
import {MagnifyingGlass} from "lucide-react";

const TopicCard = ({topic, level, description}: { topic: string; level: string; description: string }) => (
  <Card className="transition-all hover:scale-105">
    <CardHeader>
      <CardTitle className="topic-card-title">{topic}</CardTitle>
      <CardDescription className="topic-card-level">{level}</CardDescription>
    </CardHeader>
    <CardContent>
      {description}
    </CardContent>
  </Card>
);

const TopicCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <CardTitle><Skeleton className="h-6 w-40"/></CardTitle>
      <CardDescription><Skeleton className="h-4 w-24"/></CardDescription>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full"/>
      <Skeleton className="h-4 w-5/6"/>
      <Skeleton className="h-4 w-2/3"/>
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
    }, 500);
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between p-4 border-b bg-secondary rounded-md">
        <h1 className="text-2xl font-bold">EduAI</h1>
        {user ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.imageUrl}/>
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </div>
        ) : (
          <div>
            {authProviders.map((provider) => (
              <Button key={provider.id} onClick={() => alert(`Sign in with ${provider.name}`)}>
                Sign in with {provider.name}
              </Button>
            ))}
          </div>
        )}
      </header>

      <section className="p-4">
        <div className="mb-4 flex items-center space-x-2">
          <MagnifyingGlass className="h-5 w-5 text-muted-foreground"/>
          <input
            type="search"
            placeholder="Search topics..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <h2 className="text-xl font-semibold mb-2">Explore Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <>
              <TopicCardSkeleton/>
              <TopicCardSkeleton/>
              <TopicCardSkeleton/>
            </>
          ) : (
            <>
              <TopicCard
                topic="Java Programming"
                level="Beginner"
                description="Learn the basics of Java programming language."
              />
              <TopicCard
                topic="Intermediate Mathematics"
                level="Intermediate"
                description="Explore calculus, linear algebra, and differential equations."
              />
              <TopicCard
                topic="Principles of Organic Chemistry"
                level="Advanced"
                description="Delve into the structure, properties, and reactions of organic compounds."
              />
            </>
          )}
        </div>
      </section>

      <footer className="p-4">
        <p className="text-center text-muted-foreground">
          © {new Date().getFullYear()} EduAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
