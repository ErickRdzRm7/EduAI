
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  topicDescription: string;
  onSave: (updatedTitle: string, updatedDescription: string) => void;
}

export default function EditTopicDialog({
  isOpen,
  onClose,
  topicTitle,
  topicDescription,
  onSave,
}: EditTopicDialogProps) {
  const [title, setTitle] = useState(topicTitle);
  const [description, setDescription] = useState(topicDescription);

  // Update state if the props change (e.g., opening dialog for a different topic)
  useEffect(() => {
    setTitle(topicTitle);
    setDescription(topicDescription);
  }, [topicTitle, topicDescription, isOpen]); // Depend on isOpen to reset on open

  const handleSaveClick = () => {
    // Basic validation (optional)
    if (!title.trim()) {
        alert("Topic title cannot be empty.");
        return;
    }
    onSave(title.trim(), description.trim());
    onClose(); // Close dialog after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
          <DialogDescription>
            Make changes to the topic title and description. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">
              Title
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4"> {/* Use items-start for alignment */}
            <Label htmlFor="edit-description" className="text-right pt-2"> {/* Add padding-top */}
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 min-h-[100px]" // Set min-height for textarea
              placeholder="Enter a brief description for the topic..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSaveClick}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
