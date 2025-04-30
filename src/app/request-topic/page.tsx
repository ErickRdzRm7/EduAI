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

const formSchema = z.object({
  topicName: z.string().min(2, {
    message: 'Topic name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Any']).optional(),
});

export default function RequestTopicPage() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark

   // Theme loading effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as
      | 'light'
      | 'dark'
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
      // RootLayout handles initial class application via script
    }
    // If no theme is saved, the 'dark' state default is already set
  }, []);

  // Theme application effect - applies class and saves to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure this runs only on the client
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

  // Placeholder submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values); // Log the form data
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Topic Request Submitted',
        description: `Thank you for suggesting "${values.topicName}"! We'll review your request.`,
      });
      form.reset(); // Reset form after submission
    }, 500);
  }

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
       <header className="flex items-center justify-between p-4 bg-secondary rounded-md header-border">
        <div className="flex items-center gap-4"> {/* Group back button and title */}
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
                    What topic would you like to learn about?
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
                  <FormLabel>Suggested Level (Optional)</FormLabel>
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
                      <SelectItem value="Any">Any Level</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Suggest a starting difficulty level if you have one in mind.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit Request</Button>
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
