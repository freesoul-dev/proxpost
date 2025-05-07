import type { Location } from './location';
import type { Post } from '@/lib/types';
import { mockPosts } from '@/lib/mock-data';
import { calculateDistance } from '@/lib/geo';

const MAX_DISTANCE_MILES = 50;

// Simulate a database or persistent storage
let postsStorage: Post[] = [...mockPosts];


// Function to clean up expired posts from storage
function cleanupExpiredPosts() {
  const now = new Date();
  postsStorage = postsStorage.filter(post => post.expiresAt > now);
  // In a real backend, this would be a cron job or similar scheduled task.
  // For this mock, we can call it periodically or before reads, though less efficient.
  console.log("Cleaned up expired posts. Remaining:", postsStorage.length);
}

/**
 * Fetches posts within a specified radius of the user's location.
 * Simulates an API call.
 *
 * @param userLocation The current location of the user.
 * @returns A promise that resolves to an array of nearby posts.
 */
export async function getNearbyPosts(userLocation: Location): Promise<Post[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Cleanup expired posts before fetching
  cleanupExpiredPosts();

  const now = new Date();
  // In a real app, this filtering might happen on the backend
  const nearbyActivePosts = postsStorage.filter(post => {
    if (post.expiresAt <= now) return false; // Filter out expired posts
    const distance = calculateDistance(userLocation, post.location);
    return distance <= MAX_DISTANCE_MILES;
  });

  // Sort by newest first
  return nearbyActivePosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Simulates adding a new post.
 * In a real app, this would send data to a backend API.
 * @param postData Data for the new post (excluding id, createdAt, likes, comments which would be set server-side).
 */
export async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>): Promise<Post> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newPost: Post = {
        ...postData,
        id: Math.random().toString(36).substring(2, 10), // Simple unique ID generation
        createdAt: new Date(),
        likes: 0,
        comments: 0,
    };

    postsStorage.unshift(newPost); 

    return newPost;
}

// Simulate liking a post
export async function likePost(postId: string): Promise<{ success: boolean; newLikes: number }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const postIndex = postsStorage.findIndex(p => p.id === postId);
    if (postIndex > -1 && postsStorage[postIndex].expiresAt > new Date()) {
        // In a real app, you'd check if the user already liked it.
        // Here we just increment.
        postsStorage[postIndex].likes += 1;
        return { success: true, newLikes: postsStorage[postIndex].likes };
    }
    return { success: false, newLikes: postIndex > -1 ? postsStorage[postIndex].likes : 0 };
}

// Simulate adding a comment (just increments the count for now)
export async function addComment(postId: string, commentText: string): Promise<{ success: boolean; newComments: number }> {
    await new Promise(resolve => setTimeout(resolve, 250));
    const postIndex = postsStorage.findIndex(p => p.id === postId);
    if (postIndex > -1 && postsStorage[postIndex].expiresAt > new Date()) {
        postsStorage[postIndex].comments += 1;
        console.log(`Comment added to post ${postId}: "${commentText}"`); // Simulate adding comment
        return { success: true, newComments: postsStorage[postIndex].comments };
    }
    return { success: false, newComments: postIndex > -1 ? postsStorage[postIndex].comments : 0 };
}

export async function getPostById(postId: string): Promise<Post | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    cleanupExpiredPosts();
    const post = postsStorage.find(p => p.id === postId);
    if (post && post.expiresAt > new Date()) {
        return post;
    }
    return null;
}
