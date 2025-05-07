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
import { Camera, FileText, PlusCircle, Image as ImageIcon } from 'lucide-react'; // Added PlusCircle, ImageIcon
import { useToast } from '@/hooks/use-toast';
import { addPost } from '@/services/posts';
import { getCurrentLocation } from '@/services/location';
import type { Location } from '@/services/location';
import type { MediaType } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'; // For previewing cover art

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_MEDIA_SIZE = 20 * 1024 * 1024; // 20MB (for video/audio)

interface CreatePostDialogProps {
  children?: React.ReactNode; // To allow custom trigger
  onPostCreated?: () => void; // Callback for when post is created
}

export function CreatePostDialog({ children, onPostCreated }: CreatePostDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
    const [postType, setPostType] = useState<MediaType>('image'); 
    const [textContent, setTextContent] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [coverArtPreviewUrl, setCoverArtPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visibilityDuration, setVisibilityDuration] = useState<string>("24"); 
    const { toast } = useToast();

    const handlePostTypeChange = (value: string) => {
      setPostType(value as MediaType);
      setFile(null);
      setPreviewUrl(null);
      setTextContent('');
      if (value !== 'audio') {
        setCoverArtFile(null);
        setCoverArtPreviewUrl(null);
      }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            let determinedMediaType: MediaType | null = null;
            let maxSize = MAX_MEDIA_SIZE;
            let typeErrorMsg = 'Please upload an image, video, or audio file.';

            if (selectedFile.type.startsWith('image/')) {
                maxSize = MAX_IMAGE_SIZE;
                typeErrorMsg = `Maximum image size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`;
                determinedMediaType = 'image';
            } else if (selectedFile.type.startsWith('video/')) {
                typeErrorMsg = `Maximum video size is ${MAX_MEDIA_SIZE / 1024 / 1024}MB.`;
                determinedMediaType = 'video';
            } else if (selectedFile.type.startsWith('audio/')) {
                typeErrorMsg = `Maximum audio file size is ${MAX_MEDIA_SIZE / 1024 / 1024}MB.`;
                determinedMediaType = 'audio';
            }
            
            if (!determinedMediaType) {
                 toast({ title: 'Unsupported file type', description: 'Please upload an image, video, or audio file.', variant: 'destructive'});
                 return;
            }
            if (selectedFile.size > maxSize) {
                toast({ title: `${determinedMediaType.charAt(0).toUpperCase() + determinedMediaType.slice(1)} too large`, description: typeErrorMsg, variant: 'destructive'});
                return;
            }
            
            setFile(selectedFile);
            // Auto-select post type if a file is uploaded that matches a different type than currently selected.
            // This provides a smoother UX.
            if (postType !== determinedMediaType) {
               setPostType(determinedMediaType);
            }

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

    const handleCoverArtChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                toast({ title: 'Invalid cover art', description: 'Please upload an image file for cover art.', variant: 'destructive'});
                return;
            }
            if (selectedFile.size > MAX_IMAGE_SIZE) {
                toast({ title: 'Cover art too large', description: `Maximum image size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`, variant: 'destructive'});
                return;
            }
            setCoverArtFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverArtPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setCoverArtFile(null);
            setCoverArtPreviewUrl(null);
        }
    };


    const resetForm = useCallback(() => {
        setDescription('');
        setFile(null);
        setCoverArtFile(null);
        // setPostType('image'); // Keep current post type or reset to default. Current is better.
        setTextContent('');
        setPreviewUrl(null);
        setCoverArtPreviewUrl(null);
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
            let coverArtUrlToSubmit: string | undefined = undefined;

            // IMPORTANT: In a real app, 'file' and 'coverArtFile' must be uploaded to a storage service
            // Using base64 data URIs directly is NOT scalable for production.
            if (postType !== 'text' && previewUrl) {
              mediaUrl = previewUrl; // Placeholder for actual upload URL
              console.warn("Development only: Using base64 previewUrl as mediaUrl. Implement actual file upload for production.");
            }
            if (postType === 'audio' && coverArtPreviewUrl) {
              coverArtUrlToSubmit = coverArtPreviewUrl; // Placeholder
              console.warn("Development only: Using base64 coverArtPreviewUrl as coverArtUrl. Implement actual file upload for production.");
            }


            await addPost({
                userId: 'currentUser', 
                userName: 'You',
                userAvatarUrl: 'https://picsum.photos/seed/currentUser/40/40',
                mediaUrl: mediaUrl,
                coverArtUrl: coverArtUrlToSubmit,
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
             if(onPostCreated) onPostCreated();


        } catch (error) {
             console.error('Error creating post:', error);
             toast({ title: 'Failed to create post', description: (error as Error).message || 'An error occurred. Please try again.', variant: 'destructive' });
             setIsSubmitting(false);
        }
     }, [postType, file, textContent, description, isSubmitting, toast, resetForm, previewUrl, visibilityDuration, coverArtPreviewUrl, onPostCreated]);


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
            <>
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
                {postType === 'audio' && (
                    <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
                        <Label htmlFor="cover-art-upload">Cover Art (optional for audio)</Label>
                        <Input
                            id="cover-art-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleCoverArtChange}
                            disabled={isSubmitting}
                        />
                        {coverArtPreviewUrl && (
                            <div className="mt-2 flex justify-center">
                                <Image src={coverArtPreviewUrl} alt="Cover art preview" width={100} height={100} className="object-contain rounded-md" data-ai-hint="cover art" />
                            </div>
                        )}
                    </div>
                )}
            </>
        );
     };
     
     const renderPreview = () => {
        if (!previewUrl || postType === 'text') return null;

        switch(postType) {
            case 'image':
                return <Image src={previewUrl} alt="Preview" width={200} height={200} className="max-h-48 w-auto object-contain mx-auto mt-4 rounded-md" data-ai-hint="media preview" />;
            case 'video':
                return <video src={previewUrl} controls className="max-h-48 w-full mt-4 bg-black rounded-md">Your browser doesnt support video previews.</video>;
            case 'audio':
                 // For audio, primary preview is the player. Cover art is separate.
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
      <DialogContent className="sm:max-w-md bg-background/80 dark:bg-background/60 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl rounded-lg">
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
