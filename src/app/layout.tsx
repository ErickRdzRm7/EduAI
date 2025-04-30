
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Toaster} from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EduAI', // Updated title
  description: 'Your personal AI-powered learning companion.', // Updated description
};

// Script to set initial theme based on localStorage or system preference
const SetInitialTheme = `
  (function() {
    function getInitialTheme() {
      try {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
          return storedTheme;
        }
        // Optionally, check system preference if no theme is stored
        // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // return prefersDark ? 'dark' : 'light';
        return 'dark'; // Default to dark if nothing else is set
      } catch (e) {
        // localStorage access might be restricted
        return 'dark'; // Default to dark on error
      }
    }
    const theme = getInitialTheme();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
`;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Add suppressHydrationWarning */}
      <head>
         {/* Inject script to set initial theme before rendering */}
        <script dangerouslySetInnerHTML={{ __html: SetInitialTheme }} />
      </head>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased font-sans" // Ensure font-sans is applied from globals.css
          // The 'dark' class will be added/removed by the script and the toggle button
        )}
      >
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
