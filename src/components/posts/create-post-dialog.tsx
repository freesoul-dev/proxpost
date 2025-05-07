
'use client';

import { useState, useCallback, ChangeEvent, useEffect } from 'react';
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
import { Camera, FileText, PlusCircle } from 'lucide-react'; // Added PlusCircle
import { useToast } from '@/hooks/use-toast';
import { addPost } from '@/services/posts';
import { getCurrentLocation } from '@/services/location';
import type { Location } from '@/services/location';
import type { MediaType } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_MEDIA_SIZE = 20 * 1024 * 1024; // 20MB (for video/audio)

interface CreatePostDialogProps {
  children?: React.ReactNode; // To allow custom trigger
}

export function CreatePostDialog({ children }: CreatePostDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [postType, setPostType] = useState<MediaType>('image'); 
    const [textContent, setTextContent] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visibilityDuration, setVisibilityDuration] = useState<string>("24"); 
    const { toast } = useToast();

    const handlePostTypeChange = (value: string) => {
      setPostType(value as MediaType);
      setFile(null);
      setPreviewUrl(null);
      setTextContent('');
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            let determinedMediaType: MediaType | null = null;
            if (selectedFile.type.startsWith('image/')) {
                if (selectedFile.size > MAX_IMAGE_SIZE) {
                    toast({ title: 'Image too large', description: `Maximum image size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`, variant: 'destructive'});
                    return;
                }
                determinedMediaType = 'image';
            } else if (selectedFile.type.startsWith('video/')) {
                if (selectedFile.size > MAX_MEDIA_SIZE) {
                    toast({ title: 'Video too large', description: `Maximum video size is ${MAX_MEDIA_SIZE / 1024 / 1024}MB.`, variant: 'destructive'});
                    return;
                }
                determinedMediaType = 'video';
            } else if (selectedFile.type.startsWith('audio/')) {
                 if (selectedFile.size > MAX_MEDIA_SIZE) {
                    toast({ title: 'Audio file too large', description: `Maximum audio file size is ${MAX_MEDIA_SIZE / 1024 / 1024}MB.`, variant: 'destructive'});
                    return;
                }
                determinedMediaType = 'audio';
            } else {
                 toast({ title: 'Unsupported file type', description: 'Please upload an image, video, or audio file.', variant: 'destructive'});
                 return;
            }
            
            setFile(selectedFile);
            // Post type is controlled by RadioGroup, but we can auto-select if user uploads a file of a different type than selected.
            // For now, we keep it simple: user selects type, then uploads matching file.
            // if (determinedMediaType && postType !== determinedMediaType) {
            //    setPostType(determinedMediaType); 
            // }


            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setFile(null);
            setPreviewUrl(null);
        }
    };

    const resetForm = useCallback(() => {
        setDescription('');
        setFile(null);
        // setPostType('image'); // Keep current post type, or reset to default
        setTextContent('');
        setPreviewUrl(null);
        setIsSubmitting(false);
        setVisibilityDuration("24");
    }, []);

     const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;
        if (postType !== 'text' && !file) {
            toast({ title: 'No media selected', description: 'Please upload a file for your media post.', variant: 'destructive' });
            return;
        }
         if (postType === 'image' && file && !file.type.startsWith('image/')) {
            toast({ title: 'Incorrect file type', description: 'Please upload an image file for an image post.', variant: 'destructive' });
            return;
        }
        if (postType === 'video' && file && !file.type.startsWith('video/')) {
            toast({ title: 'Incorrect file type', description: 'Please upload a video file for a video post.', variant: 'destructive' });
            return;
        }
        if (postType === 'audio' && file && !file.type.startsWith('audio/')) {
            toast({ title: 'Incorrect file type', description: 'Please upload an audio file for an audio post.', variant: 'destructive' });
            return;
        }
        if (postType === 'text' && !textContent.trim()) {
            toast({ title: 'No text content', description: 'Please enter some text for your post.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const location = await getCurrentLocation();
            
            const durationMs = parseInt(visibilityDuration) * 60 * 60 * 1000;
            const expiresAt = new Date(Date.now() + durationMs);

            let mediaUrl: string | undefined = undefined;
            // IMPORTANT: In a real app, 'file' must be uploaded to a storage service (e.g., Firebase Storage, Supabase Storage, S3)
            // and 'mediaUrl' should be the URL returned by the storage service.
            // Using 'previewUrl' (a base64 data URI) directly is NOT scalable or suitable for production
            // as it embeds the entire file content in the database/data structure.
            if (postType !== 'text' && previewUrl) {
              // This is a placeholder. Replace with actual file upload logic.
              // Example: mediaUrl = await uploadFileToCloudStorage(file);
              mediaUrl = previewUrl; 
              console.warn("Development only: Using base64 previewUrl as mediaUrl. Implement actual file upload for production.");
            }

            await addPost({
                userId: 'currentUser', 
                userName: 'You',
                userAvatarUrl: 'https://picsum.photos/seed/currentUser/40/40',
                mediaUrl: mediaUrl,
                mediaType: postType,
                textContent: postType === 'text' ? textContent : undefined,
                description,
                location,
                expiresAt,
             });

             toast({ title: 'Post Created!', description: 'Your post is now live.' });
             setIsOpen(false); 
             resetForm();
             window.dispatchEvent(new CustomEvent('postCreated'));


        } catch (error) {
             console.error('Error creating post:', error);
             toast({ title: 'Failed to create post', description: (error as Error).message || 'An error occurred. Please try again.', variant: 'destructive' });
             setIsSubmitting(false);
        }
     }, [postType, file, textContent, description, isSubmitting, toast, resetForm, previewUrl, visibilityDuration]);


     const renderMediaInput = () => {
        if (postType === 'text') {
            return (
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="text-content">Your Text</Label>
                    <Textarea
                        id="text-content"
                        placeholder="Share your thoughts..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        disabled={isSubmitting}
                        rows={5}
                    />
                </div>
            );
        }
        return (
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="media-upload">Media File ({postType})</Label>
                <Input
                    id="media-upload"
                    type="file"
                    accept={postType === 'image' ? 'image/*' : postType === 'video' ? 'video/*' : 'audio/*'}
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                />
                {previewUrl && renderPreview()}
            </div>
        );
     };
     
     const renderPreview = () => {
        if (!previewUrl || postType === 'text') return null;

        switch(postType) {
            case 'image':
                return <img src={previewUrl} alt="Preview" className="max-h-48 w-auto object-contain mx-auto mt-4" data-ai-hint="media preview" />;
            case 'video':
                return <video src={previewUrl} controls className="max-h-48 w-full mt-4 bg-black">Your browser doesnt support video previews.</video>;
            case 'audio':
                return <audio src={previewUrl} controls className="w-full mt-4">Your browser doesnt support audio previews.</audio>;
            default:
                return null;
        }
     };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        {children ? children : (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Post
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/80 dark:bg-background/60 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>
            Share media or text with people nearby.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label>Post Type</Label>
                <RadioGroup value={postType} onValueChange={handlePostTypeChange} className="flex space-x-2 sm:space-x-4 flex-wrap">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="r-image" />
                        <Label htmlFor="r-image">Image</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="r-video" />
                        <Label htmlFor="r-video">Video</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="audio" id="r-audio" />
                        <Label htmlFor="r-audio">Audio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="r-text" />
                        <Label htmlFor="r-text">Text</Label>
                    </div>
                </RadioGroup>
            </div>
            
            {renderMediaInput()}

            <div className="grid w-full gap-1.5">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Add a caption or title..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            <div className="grid w-full gap-1.5">
                <Label htmlFor="visibility">Post Visibility</Label>
                <Select value={visibilityDuration} onValueChange={setVisibilityDuration} disabled={isSubmitting}>
                    <SelectTrigger id="visibility" className="bg-background hover:bg-accent/10">
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/90 dark:bg-background/80 backdrop-blur-md border-white/20 dark:border-white/10">
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="72">72 hours (3 days)</SelectItem>
                        <SelectItem value="168">168 hours (7 days)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
            </DialogClose>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || (postType === 'text' ? !textContent.trim() : !file)}
           >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
