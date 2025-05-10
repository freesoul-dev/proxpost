
'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import type { Post } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, Copy, Music2 } from 'lucide-react';
import { formatDistanceToNowStrict, formatRelative } from 'date-fns';
import { likePost, addComment } from '@/services/posts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [timeToExpire, setTimeToExpire] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    const updateExpiryTime = () => {
      if (post.expiresAt) {
        const now = new Date();
        if (post.expiresAt > now) {
          setTimeToExpire(`Expires ${formatDistanceToNowStrict(post.expiresAt, { addSuffix: true })}`);
        } else {
          setTimeToExpire('Expired');
        }
      }
    };
    updateExpiryTime();
    const interval = setInterval(updateExpiryTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [post.expiresAt]);


  const handleLike = useCallback(async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const result = await likePost(post.id);
      if (result.success) {
        setLikes(result.newLikes);
        toast({ title: 'Post Liked!' });
      } else {
        toast({ title: 'Failed to like post', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({ title: 'An error occurred', variant: 'destructive' });
    } finally {
      setIsLiking(false);
    }
  }, [post.id, isLiking, toast]);

  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommenting || !commentText.trim()) return;
    setIsCommenting(true);
    try {
        const result = await addComment(post.id, commentText);
        if (result.success) {
            setCommentsCount(result.newComments);
            setCommentText(''); 
            toast({ title: 'Comment Added!' });
        } else {
            toast({ title: 'Failed to add comment', variant: 'destructive' });
        }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: 'An error occurred', variant: 'destructive' });
    } finally {
        setIsCommenting(false);
    }
  }, [post.id, isCommenting, commentText, toast]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`; // Basic share link
    try {
        if (navigator.share) {
            await navigator.share({
                title: `Check out this post on Proximity Post!`,
                text: post.description || post.textContent || 'Shared from Proximity Post',
                url: shareUrl,
            });
            toast({ title: 'Post shared!' });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: 'Link Copied!', description: 'Share link copied to clipboard.' });
        }
    } catch (error) {
        console.error('Error sharing:', error);
        try { // Fallback to clipboard copy if navigator.share fails
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: 'Link Copied!', description: 'Share link copied to clipboard.' });
        } catch (copyError) {
            console.error('Error copying to clipboard:', copyError);
            toast({ title: 'Failed to share or copy link', variant: 'destructive' });
        }
    }
  }, [post.id, post.description, post.textContent, toast]);


  const renderMedia = () => {
    switch (post.mediaType) {
      case 'image':
        return (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.mediaUrl!}
              alt={post.description || 'User post image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={post.id === '1'} // Example: prioritize first post for LCP
              data-ai-hint="user image"
            />
          </div>
        );
      case 'video':
        return (
          <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
             <video controls className="w-full h-full object-contain" preload="metadata">
                <source src={post.mediaUrl!} />
                Your browser does not support the video tag.
             </video>
          </div>
        );
      case 'audio':
        return (
          <div className={cn(
            "relative w-full p-4 flex items-center justify-center rounded-t-lg",
            "bg-card/60 dark:bg-card/50 backdrop-blur-md border border-white/20 dark:border-white/10",
            post.coverArtUrl ? "min-h-[200px]" : ""
          )}>
            {post.coverArtUrl && (
              <Image
                src={post.coverArtUrl}
                alt={post.description || "Audio cover art"}
                fill
                className="object-cover"
                data-ai-hint="audio cover"
              />
            )}
            <div className="absolute z-10 w-full flex flex-col items-center space-y-3">
                {post.coverArtUrl && (
                    <Image src={post.coverArtUrl} alt={post.description || "Audio cover art"} width={128} height={128} className="rounded-md shadow-lg "
                        data-ai-hint="audio cover"
                    />
                )}
                {!post.coverArtUrl && <Music2 className="w-16 h-16 mb-2 text-white" />}

                <audio controls className={cn("w-full bg-card/60 dark:bg-card/50 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-lg")} preload="metadata">
                 
                    <source src={post.mediaUrl!} />                    
                    Your browser does not support the audio element.
                 </audio>
                
             </div>
          </div>
        );
      case 'text':
        return (
          <div className="px-4 py-3 min-h-[100px] rounded-t-lg">        
              <p className="text-base text-white whitespace-pre-wrap break-words">{post.textContent}</p> 
          </div>        
        );      default:
        return <div className="h-48 w-full bg-muted/50 flex items-center justify-center rounded-t-lg">Unsupported media type</div>;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group bg-card/60 dark:bg-card/50 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-lg">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-10 w-10 border border-white/10 rounded-full">
          <AvatarImage src={post.userAvatarUrl} alt={`${post.userName}'s avatar`} data-ai-hint="user avatar" />
          <AvatarFallback className="rounded-full">{post.userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-base font-medium text-white">{post.userName}</CardTitle>
          <p className="text-xs text-white/80"><span className="text-white">
            {formatRelative(post.createdAt, new Date())}</span>
            {timeToExpire && <span className="mx-1">&middot;</span>}
            {timeToExpire && <span className="text-xs text-white">{timeToExpire}</span>}
          </p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                    <Share2 className="h-4 w-4 text-white" />
                    <span className="sr-only">Share post</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/80 dark:bg-background/60 backdrop-blur-md border border-white/20 dark:border-white/10">
                <DropdownMenuItem onClick={handleShare}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-0">
         {renderMedia()}
         {post.description && post.mediaType !== 'text' && (          
           <p className="px-4 py-3 text-sm text-white">{post.description}</p>
         )}                </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 p-4">
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLiking} aria-label="Like post">
                <Heart className={`mr-2 h-4 w-4 text-white ${likes > post.likes ? 'fill-accent text-accent' : '' }`} /> <span className='text-white'>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
            </Button >
             <Button variant="ghost" size="sm" aria-label="View comments">
                <MessageCircle className="mr-2 h-4 w-4 text-white" />
                <span className="text-white">{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
             </Button>        </div>

        <form onSubmit={handleCommentSubmit} className="w-full flex gap-2 mt-2">
            <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[40px] text-sm resize-none flex-grow bg-background/70 dark:bg-background/50 border-white/20 dark:border-white/10 focus:ring-accent"
                rows={1}
                disabled={isCommenting}
            />
            <Button type="submit" size="sm" disabled={isCommenting || !commentText.trim()} className="self-end bg-accent hover:bg-accent/90 text-accent-foreground">
                {isCommenting ? 'Posting...' : 'Post'}
            </Button>
        </form>
      </CardFooter>
    </Card>
  );
}


export function PostCardSkeleton() {
  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden shadow-xl bg-background/60 dark:bg-background/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-lg">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-4 w-24 bg-muted/50" />
          <Skeleton className="h-3 w-16 bg-muted/50" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Skeleton className="aspect-video w-full bg-muted/50" />
        <div className="px-4 py-3 space-y-2">
             <Skeleton className="h-4 w-full bg-muted/50" />
             <Skeleton className="h-4 w-3/4 bg-muted/50" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4">
         <div className="flex space-x-4">
            <Skeleton className="h-8 w-20 bg-muted/50" />
            <Skeleton className="h-8 w-24 bg-muted/50" />
         </div>
         <Skeleton className="h-8 w-16 bg-muted/50" />
      </CardFooter>
    </Card>
  );
}

