
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react'; // Import useEffect and useState
import { useRouter } from 'next/navigation'; // Import useRouter


// --- Topic Data Management (Duplicated for consistency, ideally centralize) ---

interface TopicSummary {
  id: string;
  title: string;
  level: string; // Representative level
  description: string;
}

interface TopicDetail {
  id: string;
  title: string;
  content: Record<string, string[]>; // Beginner, Intermediate, Advanced content
}

const LOCAL_STORAGE_TOPICS_KEY = 'eduai-topics'; // Key for the summary list
const LOCAL_STORAGE_DETAILS_KEY = 'eduai-topic-details'; // Key for the detailed content

// Function to get topic details from localStorage
const getTopicDetailsFromStorage = (): Record<string, TopicDetail> => {
  if (typeof window === 'undefined') return {};
  try {
    const storedDetails = localStorage.getItem(LOCAL_STORAGE_DETAILS_KEY);
    return storedDetails ? JSON.parse(storedDetails) : {};
  } catch (error) {
    console.error("Error accessing or parsing localStorage for topic details:", error);
    return {};
  }
};

// Function to save topic details to localStorage
const saveTopicDetailsToStorage = (details: Record<string, TopicDetail>) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_DETAILS_KEY, JSON.stringify(details));
      // Dispatch storage event for details (optional, if other parts need detail updates)
      // window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_STORAGE_DETAILS_KEY }));
    } catch (error) {
      console.error("Error saving topic details to localStorage:", error);
    }
  }
};

// Function to save the summary topic list to localStorage
const saveTopicsSummaryToStorage = (topics: TopicSummary[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_TOPICS_KEY, JSON.stringify(topics));
      // Dispatch a storage event to notify the home page
      window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_STORAGE_TOPICS_KEY }));
    } catch (error) {
      console.error("Error saving topics summary to localStorage:", error);
    }
  }
};

// Function to get the summary topic list from localStorage
const getTopicsSummaryFromStorage = (): TopicSummary[] => {
   if (typeof window === 'undefined') return [];
   try {
     const stored = localStorage.getItem(LOCAL_STORAGE_TOPICS_KEY);
     return stored ? JSON.parse(stored) : [];
   } catch (error) {
     console.error("Error getting topics summary from localStorage:", error);
     return [];
   }
};

// --- End Topic Data Management ---

// Helper function to create slugs (consistent with home page)
const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/ /g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, ''); // Remove all non-word chars
};


const formSchema = z.object({
  topicName: z.string().min(2, {
    message: 'Topic name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Any']).default('Any'), // Changed optional to default
});

export default function RequestTopicPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

   // Theme loading effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as
      | 'light'
      | 'dark'
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
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


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topicName: '',
      description: '',
      level: 'Any',
    },
  });

  // Updated submit handler to add topic to localStorage
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting topic request:", values);

    const slug = createSlug(values.topicName);
    const newTopicLevel = values.level === 'Any' ? 'Beginner' : values.level; // Default to Beginner if 'Any'

    // 1. Create the new topic summary object
    const newTopicSummary: TopicSummary = {
      id: slug,
      title: values.topicName,
      level: newTopicLevel,
      description: values.description,
    };

    // 2. Create the new topic detail object (with placeholder content)
    const newTopicDetail: TopicDetail = {
      id: slug,
      title: values.topicName,
      content: {
        Beginner: ['Content for Beginner level is being generated...', `Details: ${values.description}`],
        Intermediate: ['Content for Intermediate level is being generated...'],
        Advanced: ['Content for Advanced level is being generated...'],
      },
    };

    // 3. Add to localStorage Summary List
    const currentSummary = getTopicsSummaryFromStorage();
    // Avoid adding duplicates based on slug
    if (!currentSummary.some(topic => topic.id === slug)) {
        const updatedSummary = [...currentSummary, newTopicSummary];
        saveTopicsSummaryToStorage(updatedSummary);
    } else {
        console.warn(`Topic with slug "${slug}" already exists in summary. Skipping summary update.`);
    }


    // 4. Add to localStorage Details
    const currentDetails = getTopicDetailsFromStorage();
    if (!currentDetails[slug]) {
        currentDetails[slug] = newTopicDetail;
        saveTopicDetailsToStorage(currentDetails);
    } else {
        console.warn(`Topic with slug "${slug}" already exists in details. Skipping details update.`);
    }


    console.log(`Created topic with slug: ${slug}`);

    toast({
      title: 'Topic Request Submitted',
      description: `"${values.topicName}" created. Redirecting to topic page...`,
    });

    router.push(`/topics/${slug}`);
  }

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
       <header className="flex items-center justify-between p-4 bg-secondary rounded-md header-border">
        <div className="flex items-center gap-4">
            <Link href="/" passHref>
                <Button variant="outline" size="icon" aria-label="Go back home">
                     <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h1 className="text-2xl font-bold">Request New Topic</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </header>

      <section className="p-4 max-w-2xl mx-auto flex-grow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="topicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quantum Physics, React Hooks" {...field} />
                  </FormControl>
                  <FormDescription>
                    What topic would you like to learn about? (This will also be used for the URL)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe what aspects of the topic you're interested in."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Providing details helps us create better content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suggested Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a suggested difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Any">Any Level (Defaults to Beginner)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Suggest a starting difficulty level. 'Any' will default to Beginner content initially.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create Topic & Go</Button>
          </form>
        </Form>
      </section>

       <footer className="p-4 mt-auto text-center text-sm text-muted-foreground">
         <p className="footer-text">
           © {new Date().getFullYear()} EduAI. All rights reserved.
         </p>
       </footer>
    </div>
  );
}

    