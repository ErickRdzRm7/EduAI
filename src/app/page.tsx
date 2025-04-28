'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useEffect, useState} from "react";
import {authProviders} from "@/config/auth";

const TopicCard = ({topic, level, description}: { topic: string; level: string; description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{topic}</CardTitle>
      <CardDescription>{level}</CardDescription>
    </CardHeader>
    <CardContent>
      {description}
    </CardContent>
  </Card>
);

export default function Home() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Mock user data. Replace with actual authentication logic.
    setUser({
      name: 'John Doe',
      imageUrl: 'https://picsum.photos/id/237/200/300',
      email: 'john.doe@example.com',
    });
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between">
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

      <section>
        <h2 className="text-xl font-semibold mb-2">Explore Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </section>

      <footer>
        <p className="text-center text-muted-foreground">
          © {new Date().getFullYear()} EduAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
