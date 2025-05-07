'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button'; // For the trigger, if needed, but auto-show

const GUIDELINES_AGREED_KEY = 'proximityPostGuidelinesAgreed_v1';

export function CommunityGuidelinesModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAgreed = localStorage.getItem(GUIDELINES_AGREED_KEY);
    if (!hasAgreed) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem(GUIDELINES_AGREED_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="bg-background/80 dark:bg-background/60 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome to Proximity Post!</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-foreground/90 dark:text-foreground/80">
            <p>We're excited to have you. To ensure a positive experience for everyone, please keep these values in mind:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Respect:</strong> Treat all users and their content with courtesy. Avoid offensive language, harassment, or hate speech.</li>
              <li><strong>Simplicity:</strong> Share moments, media, and thoughts relevant to your local surroundings. Keep it concise and engaging.</li>
              <li><strong>Safety:</strong> Do not share private information (yours or others'), illegal content, or anything that could compromise safety.</li>
            </ul>
            <p>By clicking "I Agree", you acknowledge and agree to uphold these community guidelines.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAgree} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            I Agree
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
