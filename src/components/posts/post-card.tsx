'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import type { Post } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, PlayCircle, Volume2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { likePost, addComment } from '@/services/posts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { toast } = useToast();

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
            setCommentText(''); // Clear input
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


  const renderMedia = () => {
    switch (post.mediaType) {
      case 'image':
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={post.mediaUrl}
              alt={post.description || 'User post'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={post.id === '1'} // Prioritize loading the first image
            />
          </div>
        );
      case 'video':
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black flex items-center justify-center">
             {/* Basic video placeholder - A real app would use a video player */}
             <video controls className="w-full h-full object-contain" preload="metadata">
                <source src={post.mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
             </video>
          </div>
        );
      case 'audio':
        return (
           <div className="relative w-full rounded-md bg-secondary p-4 flex items-center justify-center">
             {/* Basic audio placeholder - A real app would use an audio player */}
             <audio controls className="w-full" preload="metadata">
                <source src={post.mediaUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
             </audio>
          </div>
        );
      default:
        return <div className="h-48 w-full bg-muted flex items-center justify-center rounded-md">Unsupported media type</div>;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.userAvatarUrl} alt={`${post.userName}'s avatar`} />
          <AvatarFallback>{post.userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-base font-medium">{post.userName}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {renderMedia()}
        {post.description && (
           <p className="px-4 py-3 text-sm">{post.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 p-4">
        <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLiking} aria-label="Like post">
                <Heart className={`mr-2 h-4 w-4 ${likes > post.likes ? 'fill-red-500 text-red-500' : '' }`} />
                {likes} {likes === 1 ? 'Like' : 'Likes'}
            </Button>
             <Button variant="ghost" size="sm" aria-label="View comments">
                <MessageCircle className="mr-2 h-4 w-4" />
                {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
             </Button>
        </div>
        {/* Basic Comment Form */}
        <form onSubmit={handleCommentSubmit} className="w-full flex gap-2 mt-2">
            <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[40px] text-sm resize-none flex-grow"
                rows={1}
                disabled={isCommenting}
            />
            <Button type="submit" size="sm" disabled={isCommenting || !commentText.trim()} className="self-end">
                {isCommenting ? 'Posting...' : 'Post'}
            </Button>
        </form>
      </CardFooter>
    </Card>
  );
}


export function PostCardSkeleton() {
  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden shadow-md">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Skeleton className="aspect-video w-full" />
        <div className="px-4 py-3 space-y-2">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4">
         <div className="flex space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
         </div>
         <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );
}
