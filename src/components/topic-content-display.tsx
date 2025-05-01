
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const handleCheckboxChange = (level: string, itemIndex: number, checked: boolean | 'indeterminate') => {
    // Ensure checked is boolean
     if (typeof checked === 'boolean') {
         const key = `${level}-${itemIndex}`;
         setProgress(prev => ({ ...prev, [key]: checked }));
     }
  };

  // Calculate progress percentage for a specific level
  const calculateProgress = (level: string): number => {
    const items = content[level] ?? [];
    if (items.length === 0) return 0;

    const completedCount = items.reduce((count, _, index) => {
      const key = `${level}-${index}`;
      return progress[key] ? count + 1 : count;
    }, 0);

    return Math.round((completedCount / items.length) * 100);
  };

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  if (isLoadingProgress) {
     // Optional: Add a loading skeleton here
     return <p>Loading learning points...</p>;
  }

  return (
    <Accordion type="single" collapsible defaultValue={`item-${initialLevel}`} className="w-full">
      {levels.map((level) => {
        const levelContent = content[level] ?? [];
        const progressPercent = calculateProgress(level);
        const levelKey = `item-${level}`; // Unique key for AccordionItem

        return (
          <AccordionItem value={levelKey} key={levelKey}>
            <AccordionTrigger>
              <div className="flex justify-between items-center w-full pr-2">
                <span>{level} Level</span>
                {levelContent.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                       {progressPercent}% complete
                    </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {levelContent.length > 0 ? (
                <Card className="border-none shadow-none"> {/* Remove card border/shadow inside accordion */}
                  <CardHeader className="pt-0 pb-2"> {/* Adjust padding */}
                     {/* Progress bar */}
                     <Progress value={progressPercent} className="w-full h-2" />
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2"> {/* Adjust padding */}
                    {levelContent.map((item, index) => {
                      const itemId = `${levelKey}-${index}`; // Unique ID for checkbox and label
                      const itemKey = `${level}-${index}`; // Key for progress state
                      const isChecked = !!progress[itemKey]; // Ensure boolean

                      return (
                        <div key={itemId} className="flex items-center space-x-3">
                          <Checkbox
                            id={itemId}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleCheckboxChange(level, index, checked)}
                          />
                          <Label
                            htmlFor={itemId}
                            className={`flex-1 text-sm ${isChecked ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {item}
                          </Label>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ) : (
                <p className="text-muted-foreground px-6 pb-4 pt-0">No content generated for this level.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
