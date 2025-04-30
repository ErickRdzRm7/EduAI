
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageCircle, Moon, Sun, ClipboardCheck } from 'lucide-react'; // Keep ClipboardCheck
import Link from 'next/link';
import AiTutor from '@/components/ai-tutor';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Import CardFooter
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual data fetching
const MOCK_TOPICS: Record<string, { title: string; content: Record<string, string[]> }> = {
  'java-programming': {
    title: 'Java Programming',
    content: {
      Beginner: [
        'Introduction to Java: What is Java? History, Features.',
        'Setting up the Environment: JDK Installation, IDE Setup (IntelliJ, Eclipse).',
        'Basic Syntax: Variables, Data Types, Operators.',
        'Control Flow: If-else statements, Loops (for, while).',
        'First Java Program: Hello World!',
      ],
      Intermediate: [
        'Object-Oriented Programming (OOP): Classes, Objects, Inheritance, Polymorphism, Encapsulation.',
        'Methods: Defining and Calling Methods.',
        'Arrays and Collections: ArrayList, HashMap.',
        'Exception Handling: Try-catch blocks.',
      ],
      Advanced: [
        'Generics: Understanding Type Parameters.',
        'Multithreading: Creating and Managing Threads.',
        'File I/O: Reading and Writing Files.',
        'Introduction to Java Frameworks (Spring Boot).',
        'Lambda Expressions and Streams.',
      ],
    },
  },
  'intermediate-mathematics': {
    title: 'Intermediate Mathematics',
    content: {
      Beginner: [ // Assuming "Intermediate" topic might still have levels
        'Review of Algebra: Equations, Inequalities.',
        'Functions: Domain, Range, Types of Functions.',
        'Introduction to Limits.',
      ],
      Intermediate: [
        'Derivatives: Definition, Rules (Power, Product, Quotient, Chain).',
        'Applications of Derivatives: Rate of Change, Optimization.',
        'Integrals: Definite and Indefinite Integrals, Fundamental Theorem of Calculus.',
        'Techniques of Integration.',
      ],
      Advanced: [
        'Sequences and Series: Convergence Tests.',
        'Differential Equations: First Order Equations.',
        'Multivariable Calculus Introduction.',
      ],
    },
  },
  'organic-chemistry-principles': {
     title: 'Organic Chemistry Principles',
     content: {
         Beginner: [
             'Introduction to Organic Chemistry: Bonding, Lewis Structures.',
             'Functional Groups: Alkanes, Alkenes, Alkynes, Alcohols, Ethers.',
             'Nomenclature: IUPAC Naming.',
         ],
         Intermediate: [
             'Stereochemistry: Chirality, Enantiomers, Diastereomers.',
             'Reaction Mechanisms: SN1, SN2, E1, E2 Reactions.',
             'Spectroscopy Basics: IR, NMR.',
         ],
         Advanced: [
             'Aromaticity: Huckel\'s Rule, Electrophilic Aromatic Substitution.',
             'Carbonyl Chemistry: Aldehydes, Ketones, Carboxylic Acids and Derivatives.',
             'Synthesis Strategies.',
             'Advanced Spectroscopic Analysis.',
         ]
     }
  },
  'data-structures': {
    title: 'Data Structures',
    content: {
      Beginner: [
        'Introduction: What are Data Structures? Why are they important?',
        'Arrays: Definition, Operations, Time Complexity.',
        'Linked Lists: Singly Linked Lists, Doubly Linked Lists.',
      ],
      Intermediate: [
        'Stacks: LIFO Principle, Operations (Push, Pop).',
        'Queues: FIFO Principle, Operations (Enqueue, Dequeue).',
        'Trees: Binary Trees, Binary Search Trees (BST).',
        'Tree Traversal: Inorder, Preorder, Postorder.',
      ],
      Advanced: [
        'Graphs: Representation (Adjacency Matrix, Adjacency List).',
        'Graph Traversal: Breadth-First Search (BFS), Depth-First Search (DFS).',
        'Hash Tables: Collision Resolution Techniques.',
        'Heaps: Min-Heap, Max-Heap.',
      ],
    },
  },
   'linear-algebra': {
    title: 'Linear Algebra',
    content: {
      Beginner: [
        'Introduction to Vectors: Geometric Interpretation, Operations.',
        'Matrices: Definition, Types, Operations (Addition, Multiplication).',
        'Systems of Linear Equations: Gaussian Elimination.',
      ],
      Intermediate: [
        'Vector Spaces and Subspaces.',
        'Linear Independence, Basis, Dimension.',
        'Determinants: Properties and Calculation.',
      ],
      Advanced: [
        'Eigenvalues and Eigenvectors.',
        'Diagonalization.',
        'Inner Product Spaces, Orthogonality.',
        'Linear Transformations.',
      ],
    },
  },
   'web-development-basics': {
    title: 'Web Development Basics',
    content: {
      Beginner: [
        'Introduction to the Web: How Websites Work.',
        'HTML Fundamentals: Tags, Elements, Attributes, Structure.',
        'Basic HTML Elements: Headings, Paragraphs, Lists, Links, Images.',
        'Introduction to CSS: Selectors, Properties, Values.',
      ],
      Intermediate: [
        'CSS Box Model: Margin, Border, Padding, Content.',
        'CSS Layouts: Flexbox basics, Grid basics.',
        'Styling Text and Fonts.',
        'Introduction to JavaScript: Variables, Data Types, Operators.',
      ],
      Advanced: [
        'JavaScript Functions and Control Flow.',
        'DOM Manipulation Basics.',
        'Event Handling.',
        'Responsive Design Principles.',
        'Introduction to Version Control (Git).',
      ],
    },
  },
  // Add other topics...
};


export default function TopicPage() {
  const params = useParams();
  const topicId = params.topicId as string; // Get topic ID from URL
  const [topicData, setTopicData] = useState<{ title: string; content: Record<string, string[]> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showAiTutor, setShowAiTutor] = useState(false); // State to toggle AI tutor visibility
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner'); // Track selected level
  const { toast } = useToast(); // Get toast function

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
        document.documentElement.classList.add('dark'); // Default to dark
    }

    // Simulate fetching topic data
    setTimeout(() => {
      const data = MOCK_TOPICS[topicId];
      if (data) {
        setTopicData(data);
      }
      setLoading(false);
    }, 500); // Simulate network delay
  }, [topicId]);

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


  const toggleTheme = () => {
    setTheme((prevTheme) => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        // The class toggling logic in RootLayout should handle the visual change
        // Here we just update the state and localStorage
        localStorage.setItem('theme', newTheme);
        return newTheme;
    });
};

  const handleTakeQuiz = () => {
    // Placeholder action - show a toast message and log the intent
    const quizTitle = topicData?.title || 'this topic';
    const quizLevel = selectedLevel;
    console.log(`User initiated quiz for ${quizTitle} - ${quizLevel} level.`);
    toast({
      title: 'Quiz Feature Coming Soon!',
      description: `A quiz for ${quizTitle} (${quizLevel}) will be available soon. Check back later!`,
      variant: "default", // Optional: ensures default toast styling
    });
    // Future implementation: Navigate to quiz page or open quiz modal
    // Example: router.push(`/topics/${topicId}/quiz?level=${selectedLevel}`);
  };


  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
        {/* Skeleton Header */}
        <header className="flex items-center justify-between p-4 bg-secondary rounded-md header-border">
           <div className="flex items-center gap-4">
             <Skeleton className="h-8 w-8 rounded-md" />
             <Skeleton className="h-8 w-48 rounded-md" />
           </div>
           <div className="flex items-center gap-4">
             <Skeleton className="h-8 w-8 rounded-full" />
             <Skeleton className="h-8 w-28 rounded-md" /> {/* Skeleton for Ask AI button */}
           </div>
        </header>
        {/* Skeleton Content */}
        <div className="p-4 space-y-4 flex-grow">
            <Skeleton className="h-10 w-full mb-4 rounded-md" /> {/* Tabs Skeleton */}
            <Card>
              <CardHeader>
                 <Skeleton className="h-6 w-1/3 mb-2 rounded-md"/>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full rounded-md"/>
                <Skeleton className="h-4 w-full rounded-md"/>
                <Skeleton className="h-4 w-5/6 rounded-md"/>
                <Skeleton className="h-4 w-full rounded-md"/>
                <Skeleton className="h-4 w-4/6 rounded-md"/>
              </CardContent>
               <CardFooter>
                 <Skeleton className="h-10 w-36 rounded-md"/> {/* Skeleton for Quiz button */}
               </CardFooter>
            </Card>
        </div>
         <footer className="p-4 mt-auto text-center">
           <Skeleton className="h-4 w-1/2 mx-auto rounded-md"/>
         </footer>
      </div>
    );
  }

  if (!topicData) {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center gap-6 min-h-screen text-center">
            <h1 className="text-2xl font-bold text-destructive">Topic Not Found</h1>
            <p className="text-muted-foreground">The topic you requested ({topicId}) could not be found.</p>
             <Link href="/" passHref>
                <Button variant="outline">
                     <ArrowLeft className="mr-2 h-4 w-4" /> Go Back Home
                </Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
      <header className="flex items-center justify-between p-4 bg-secondary rounded-md header-border">
        <div className="flex items-center gap-4">
          <Link href="/" passHref>
            <Button variant="outline" size="icon" aria-label="Go back home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{topicData.title}</h1>
        </div>
         <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
             {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
           </Button>
           {/* Reverted back to Ask AI Tutor button */}
           <Button variant="outline" onClick={() => setShowAiTutor(true)}>
             <MessageCircle className="mr-2 h-4 w-4" /> Ask AI Tutor
           </Button>
         </div>
      </header>

      <section className="p-4 flex-grow">
        <Tabs defaultValue="Beginner" className="w-full" onValueChange={(value) => setSelectedLevel(value as 'Beginner' | 'Intermediate' | 'Advanced')}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="Beginner">Beginner</TabsTrigger>
            <TabsTrigger value="Intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="Advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="Beginner">
            <Card>
              <CardHeader>
                <CardTitle>Beginner Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topicData.content.Beginner.map((item, index) => (
                  <p key={index} className="text-foreground leading-relaxed">{item}</p>
                ))}
                {/* Add more structured content like code blocks, images here */}
              </CardContent>
              <CardFooter> {/* Added Footer for the Quiz button */}
                <Button variant="outline" onClick={handleTakeQuiz}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Take a Quiz
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="Intermediate">
             <Card>
              <CardHeader>
                <CardTitle>Intermediate Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topicData.content.Intermediate.map((item, index) => (
                  <p key={index} className="text-foreground leading-relaxed">{item}</p>
                ))}
                 {/* Add more structured content like code blocks, images here */}
              </CardContent>
               <CardFooter> {/* Added Footer for the Quiz button */}
                <Button variant="outline" onClick={handleTakeQuiz}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Take a Quiz
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="Advanced">
             <Card>
              <CardHeader>
                <CardTitle>Advanced Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topicData.content.Advanced.map((item, index) => (
                  <p key={index} className="text-foreground leading-relaxed">{item}</p>
                ))}
                 {/* Add more structured content like code blocks, images here */}
              </CardContent>
               <CardFooter> {/* Added Footer for the Quiz button */}
                <Button variant="outline" onClick={handleTakeQuiz}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Take a Quiz
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* AI Tutor Drawer/Modal */}
      <AiTutor
        isOpen={showAiTutor}
        onClose={() => setShowAiTutor(false)}
        topic={topicData.title}
        level={selectedLevel} // Pass the currently selected level
      />

      <footer className="p-4 mt-auto text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EduAI. All rights reserved.
      </footer>
    </div>
  );
}
