import type { Location } from './location';
import type { Post } from '@/lib/types';
import { mockPosts } from '@/lib/mock-data';
import { calculateDistance } from '@/lib/geo';

const MAX_DISTANCE_MILES = 50;

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

  // In a real app, this filtering might happen on the backend
  const nearbyPosts = mockPosts.filter(post => {
    const distance = calculateDistance(userLocation, post.location);
    return distance <= MAX_DISTANCE_MILES;
  });

  // Sort by newest first
  return nearbyPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
        id: Math.random().toString(36).substring(7), // Simple unique ID generation
        createdAt: new Date(),
        likes: 0,
        comments: 0,
    };

    // Add to the mock data (in a real app, the server handles this)
    mockPosts.unshift(newPost); // Add to the beginning

    return newPost;
}

// Simulate liking a post
export async function likePost(postId: string): Promise<{ success: boolean; newLikes: number }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const postIndex = mockPosts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        // In a real app, you'd check if the user already liked it.
        // Here we just increment.
        mockPosts[postIndex].likes += 1;
        return { success: true, newLikes: mockPosts[postIndex].likes };
    }
    return { success: false, newLikes: 0 };
}

// Simulate adding a comment (just increments the count for now)
export async function addComment(postId: string, commentText: string): Promise<{ success: boolean; newComments: number }> {
    await new Promise(resolve => setTimeout(resolve, 250));
     const postIndex = mockPosts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        mockPosts[postIndex].comments += 1;
        console.log(`Comment added to post ${postId}: "${commentText}"`); // Simulate adding comment
        return { success: true, newComments: mockPosts[postIndex].comments };
    }
    return { success: false, newComments: 0 };
}
