
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface TopicContentDisplayProps {
  topicId: string; // Unique ID for the topic
  content: Record<string, string[]>; // Content keyed by level (Beginner, Intermediate, Advanced)
  initialLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Key for storing progress in localStorage
const getProgressStorageKey = (topicId: string) => `eduai-progress-${topicId}`;

export default function TopicContentDisplay({ topicId, content, initialLevel }: TopicContentDisplayProps) {
  // State to track completion status of each item, loaded from localStorage
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Load progress from localStorage on mount
  useEffect(() => {
    setIsLoadingProgress(true);
    const storageKey = getProgressStorageKey(topicId);
    try {
      const storedProgress = localStorage.getItem(storageKey);
      if (storedProgress) {
        setProgress(JSON.parse(storedProgress));
      } else {
        // Initialize if not found (should have been initialized on creation)
        localStorage.setItem(storageKey, JSON.stringify({}));
        setProgress({}); // Initialize state too
      }
    } catch (error) {
      console.error("Error loading progress from localStorage:", error);
      // Initialize empty progress if loading fails
      setProgress({});
    } finally {
       setIsLoadingProgress(false);
    }
  }, [topicId]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    // Don't save during initial load
    if (isLoadingProgress) return;

    const storageKey = getProgressStorageKey(topicId);
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving progress to localStorage:", error);
    }
  }, [progress, topicId, isLoadingProgress]);

  const handleCheckboxChange = (itemIndex: number, checked: boolean | 'indeterminate') => {
    // Ensure checked is boolean
     if (typeof checked === 'boolean') {
         const key = `${initialLevel}-${itemIndex}`; // Use initialLevel directly
         setProgress(prev => ({ ...prev, [key]: checked }));
     }
  };

  // Calculate progress percentage for the initial level
  const calculateProgress = (): number => {
    const items = content[initialLevel] ?? [];
    if (items.length === 0) return 0;

    const completedCount = items.reduce((count, _, index) => {
      const key = `${initialLevel}-${index}`;
      return progress[key] ? count + 1 : count;
    }, 0);

    return Math.round((completedCount / items.length) * 100);
  };

  const levelContent = content[initialLevel] ?? [];
  const progressPercent = calculateProgress();

  if (isLoadingProgress) {
     // Loading Skeleton
     return (
        <Card className="border-border shadow-sm">
           <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32 mb-2" />
               <Skeleton className="h-2 w-full" />
           </CardHeader>
           <CardContent className="space-y-3 pt-2">
               <div className="flex items-center space-x-3">
                 <Skeleton className="h-4 w-4" />
                 <Skeleton className="h-4 w-4/5" />
               </div>
               <div className="flex items-center space-x-3">
                 <Skeleton className="h-4 w-4" />
                 <Skeleton className="h-4 w-3/4" />
               </div>
                <div className="flex items-center space-x-3">
                 <Skeleton className="h-4 w-4" />
                 <Skeleton className="h-4 w-5/6" />
               </div>
           </CardContent>
        </Card>
     );
  }

  return (
      <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
             <CardTitle className="text-lg font-medium flex justify-between items-center">
                 <span>{initialLevel} Level Content</span>
                 {levelContent.length > 0 && (
                    <span className="text-sm text-muted-foreground font-normal">
                       {progressPercent}% complete
                    </span>
                )}
             </CardTitle>
             {/* Progress bar */}
             {levelContent.length > 0 && (
                <Progress value={progressPercent} className="w-full h-2 mt-2" />
             )}
          </CardHeader>
          <CardContent className="space-y-3 pt-4"> {/* Increased top padding */}
            {levelContent.length > 0 ? (
              levelContent.map((item, index) => {
                const itemId = `${initialLevel}-${index}`; // Unique ID for checkbox and label
                const itemKey = `${initialLevel}-${index}`; // Key for progress state
                const isChecked = !!progress[itemKey]; // Ensure boolean

                return (
                  <div key={itemId} className="flex items-center space-x-3">
                    <Checkbox
                      id={itemId}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckboxChange(index, checked)}
                    />
                    <Label
                      htmlFor={itemId}
                      className={`flex-1 text-sm ${isChecked ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {item}
                    </Label>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground italic">No learning points available for this level yet.</p>
            )}
          </CardContent>
        </Card>
  );
}
