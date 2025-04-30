'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Image as ImageIcon, Video, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addPost } from '@/services/posts';
import { getCurrentLocation } from '@/services/location';
import type { Location } from '@/services/location';
import type { MediaType } from '@/lib/types';


export function CreatePostDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [mediaType, setMediaType] = useState<MediaType | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);

            // Determine media type
            if (selectedFile.type.startsWith('image/')) {
                setMediaType('image');
            } else if (selectedFile.type.startsWith('video/')) {
                setMediaType('video');
            } else if (selectedFile.type.startsWith('audio/')) {
                setMediaType('audio');
            } else {
                setMediaType(null); // Unsupported type
                 toast({ title: 'Unsupported file type', description: 'Please upload an image, video, or audio file.', variant: 'destructive'});
                 setFile(null); // Clear the file
                 setPreviewUrl(null);
                 return;
            }

            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
             reader.readAsDataURL(selectedFile);
        } else {
            setFile(null);
            setMediaType(null);
            setPreviewUrl(null);
        }
    };

    const resetForm = useCallback(() => {
        setDescription('');
        setFile(null);
        setMediaType(null);
        setPreviewUrl(null);
        setIsSubmitting(false);
    }, []);

     const handleSubmit = useCallback(async () => {
        if (!file || !mediaType || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const location = await getCurrentLocation();
             // In a real app, you would upload the file to a storage service (like Firebase Storage, S3)
             // and get back a URL. Here, we'll just use the preview URL as a placeholder.
             const mediaUrl = previewUrl!; // Use the preview URL for mock/demo

             await addPost({
                // Mock user data - replace with actual user auth info
                userId: 'currentUser',
                userName: 'You',
                userAvatarUrl: 'https://picsum.photos/seed/currentUser/40/40',
                mediaUrl,
                mediaType,
                description,
                location,
             });

             toast({ title: 'Post Created!', description: 'Your post is now live.' });
             setIsOpen(false); // Close dialog on success
             resetForm();
             // Optionally: Trigger a refresh of the post feed
             // window.dispatchEvent(new Event('refreshFeed')); // Example custom event

        } catch (error) {
             console.error('Error creating post:', error);
             toast({ title: 'Failed to create post', description: 'An error occurred. Please try again.', variant: 'destructive' });
             setIsSubmitting(false); // Allow retry
        }
     }, [file, mediaType, description, isSubmitting, toast, resetForm, previewUrl]);


     const renderPreview = () => {
        if (!previewUrl || !mediaType) return null;

        switch(mediaType) {
            case 'image':
                return <img src={previewUrl} alt="Preview" className="max-h-48 w-auto rounded-md object-contain mx-auto mt-4" />;
            case 'video':
                return <video src={previewUrl} controls className="max-h-48 w-full rounded-md mt-4 bg-black">Your browser doesnt support video previews.</video>;
            case 'audio':
                return <audio src={previewUrl} controls className="w-full mt-4">Your browser doesnt support audio previews.</audio>;
             default:
                return null;
        }
     };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Camera className="mr-2 h-4 w-4" /> Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>
            Share media with people nearby. Upload an image, video, or audio file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="media-upload">Media File</Label>
            <Input
              id="media-upload"
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
             {previewUrl && renderPreview()}
          </div>
          <div className="grid w-full gap-1.5">
             <Label htmlFor="description">Description (optional)</Label>
             <Textarea
                id="description"
                placeholder="Tell us about your media..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
             />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            </DialogClose>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!file || !mediaType || isSubmitting}
           >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
