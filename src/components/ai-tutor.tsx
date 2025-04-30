'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { askAiTutor, type AskAiTutorInput, type AskAiTutorOutput } from '@/ai/flows/ai-tutor-question';
import { AlertCircle } from 'lucide-react'; // Icon for errors

interface AiTutorProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function AiTutor({ isOpen, onClose, topic, level }: AiTutorProps) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const userMessage: ChatMessage = { sender: 'user', text: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setQuestion(''); // Clear input field

    try {
      const input: AskAiTutorInput = {
        topic: topic,
        level: level,
        question: question.trim(),
      };
      const output: AskAiTutorOutput = await askAiTutor(input);

      const aiMessage: ChatMessage = { sender: 'ai', text: output.answer };
      setChatHistory((prev) => [...prev, aiMessage]);

    } catch (err) {
      console.error('Error calling AI Tutor:', err);
      setError('Sorry, I encountered an error trying to answer your question. Please try again.');
      // Optionally add the error message back to chat history for visibility
       const errorMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
       setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline on Enter
      handleAskQuestion();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full w-full sm:max-w-lg p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Ask AI Tutor about {topic}</SheetTitle>
          <SheetDescription>
            Get help with specific questions related to the <span className="font-semibold">{level}</span> level content.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                   {/* Simple Markdown-like handling for code blocks */}
                   {message.text.split('```').map((part, i) => {
                     if (i % 2 === 1) { // Inside a code block
                       return <pre key={i} className="bg-muted text-muted-foreground p-2 rounded-md my-2 overflow-x-auto text-sm"><code >{part.trim()}</code></pre>;
                     } else { // Regular text
                       return <p key={i} className="whitespace-pre-wrap">{part}</p>;
                     }
                   })}
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                     <Skeleton className="h-10 w-24 rounded-lg bg-secondary" />
                </div>
            )}
             {error && (
              <div className="flex items-center p-3 rounded-md bg-destructive/20 text-destructive border border-destructive">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t">
          <div className="flex w-full gap-2 items-start">
            <Textarea
              id="question"
              placeholder="Ask your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow resize-none"
              rows={2} // Start with 2 rows, can expand
              disabled={isLoading}
            />
            <Button onClick={handleAskQuestion} disabled={isLoading || !question.trim()}>
              {isLoading ? 'Asking...' : 'Ask'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
