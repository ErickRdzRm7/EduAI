
'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Moon, Sun, LogOut, User as UserIcon } from 'lucide-react';

// Simple SVG for EduAI logo (Book + Brain/Chip)
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


interface User {
  name: string;
  imageUrl?: string;
}

interface AppHeaderProps {
  user: User | null; // User can be null if not logged in or during loading
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignOut: () => void;
}

const AppHeader = React.memo(({ user, theme, onToggleTheme, onSignOut }: AppHeaderProps) => {
  // If user is null (e.g. during initial auth check before user is set),
  // we might not want to render the full header or render a placeholder.
  // For simplicity, this example assumes user will be non-null when header is shown.
  // The parent component (Home) already handles the authLoading/!user case.

  const avatarFallbackContent = user?.name && user.name !== 'User'
    ? user.name[0].toUpperCase()
    : <UserIcon className="h-5 w-5" />;

  return (
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
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
        {user && ( // Only show user-specific part if user exists
          <div className="flex items-center gap-2">
            <Link href="/profile" passHref>
             <Avatar className="cursor-pointer">
               <AvatarImage src={user.imageUrl} alt={user.name} />
               <AvatarFallback>{avatarFallbackContent}</AvatarFallback>
             </Avatar>
            </Link>
            {user.name !== 'User' && (
                <Link href="/profile" passHref>
                    <span className="cursor-pointer hover:underline hidden sm:block">{user.name}</span>
                </Link>
            )}
             <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out">
               <LogOut className="h-5 w-5" />
             </Button>
          </div>
        )}
      </div>
    </header>
  );
});

AppHeader.displayName = 'AppHeader';
export default AppHeader;

