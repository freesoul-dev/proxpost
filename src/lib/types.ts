import type { Location } from '@/services/location';

export type MediaType = 'image' | 'video' | 'audio' | 'text';

export interface Post {
  id: string;
  userId: string; // In a real app, this might link to a User object
  userName: string; // Simple user identifier for display
  userAvatarUrl?: string; // Optional user avatar
  mediaUrl?: string; // Optional, especially for text posts
  coverArtUrl?: string; // Optional: For audio posts, URL to an image for cover art
  mediaType: MediaType;
  textContent?: string; // For text posts
  description?: string; // Optional description for any post type
  location: Location;
  createdAt: Date;
  expiresAt: Date; // New: For post visibility duration
  likes: number;
  comments: number;
}
