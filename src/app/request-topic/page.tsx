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
import { ArrowLeft, Loader2, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { generateTopicContent, type GenerateTopicContentInput } from '@/ai/flows/generate-topic-content-flow';

// --- Topic Data Management ---
interface TopicDetail {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  content: Record<string, string[]>;
  description?: string;
}
const LOCAL_STORAGE_DETAILS_KEY = 'eduai-topic-details';
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
const saveTopicDetailsToStorage = (details: Record<string, TopicDetail>) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_DETAILS_KEY, JSON.stringify(details));
      window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_STORAGE_DETAILS_KEY }));
    } catch (error) {
      console.error("Error saving topic details to localStorage:", error);
    }
  }
};
// --- End Topic Data Management ---

const createSlug = (text: string): string => {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const formSchema = z.object({
  topicName: z.string().min(2, { message: 'Topic name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
});

export default function RequestTopicPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
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
      level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log("Submitting topic request:", values);
    const slug = createSlug(values.topicName);
    const newTopicLevel = values.level;
    let generatedContent: TopicDetail['content'];
    try {
      const aiInput: GenerateTopicContentInput = {
        topicName: values.topicName,
        description: values.description,
        baseLevel: newTopicLevel,
      };
      const aiOutput = await generateTopicContent(aiInput);
      generatedContent = {
        Beginner: aiOutput.beginner,
        Intermediate: aiOutput.intermediate,
        Advanced: aiOutput.advanced,
      };
      console.log("AI generated content:", generatedContent);
    } catch (error) {
      console.error("Error generating topic content with AI:", error);
      toast({
        title: 'AI Content Generation Failed',
        description: 'Could not generate learning points. Using placeholders.',
        variant: 'destructive',
      });
      generatedContent = {
        Beginner: [`Introduction to ${values.topicName} (Beginner)`, `Topic Description: ${values.description}`, 'More content coming soon...'],
        Intermediate: [`Welcome to ${values.topicName} (Intermediate)!`, 'More content coming soon...'],
        Advanced: [`Welcome to ${values.topicName} (Advanced)!`, 'More content coming soon...'],
      };
    } finally {
      setIsSubmitting(false);
    }

    const newTopicDetail: TopicDetail = {
      id: slug,
      title: values.topicName,
      level: newTopicLevel,
      description: values.description,
      content: generatedContent,
    };
    const currentDetails = getTopicDetailsFromStorage();
    if (currentDetails[slug]) {
      toast({
        title: 'Topic Exists',
        description: `A topic with the name "${values.topicName}" already exists. Updating content.`,
        variant: 'default',
      });
    }
    currentDetails[slug] = newTopicDetail;
    saveTopicDetailsToStorage(currentDetails);
    console.log(`Created/Updated topic details for slug: ${slug}`);

    const progressKey = `eduai-progress-${slug}`;
    if (!localStorage.getItem(progressKey)) {
      try {
        localStorage.setItem(progressKey, JSON.stringify({}));
        console.log(`Initialized progress tracking for topic: ${slug}`);
      } catch (e) {
        console.error(`Failed to initialize progress for ${slug}:`, e);
      }
    }

    toast({
      title: 'Topic Created/Updated',
      description: `"${values.topicName}" (${newTopicLevel}) created/updated with AI suggestions.`,
    });
    // Opcional: Redirigir aquí si lo deseas
    // router.push(`/topics/${slug}`);
  }

  const toggleTheme = () => setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
      <header className="flex items-center justify-between flex-wrap gap-y-4 p-4 bg-secondary rounded-md header-border">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" passHref>
            <Button aria-label="Go back home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Request New Topic</h1>
        </div>
        <Button className="ghost icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </header>

      <section className="p-4 max-w-2xl mx-auto flex-grow space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="topicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quantum Physics, React Hooks" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>What topic would you like to learn about?</FormDescription>
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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>Providing details helps the AI generate better learning points.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Difficulty Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the primary difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the main difficulty level for this topic.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating & Creating...
                </>
              ) : (
                "Create Topic with AI"
              )}
            </Button>
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