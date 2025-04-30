import type { Location } from '@/services/location';

export type MediaType = 'image' | 'video' | 'audio';

export interface Post {
  id: string;
  userId: string; // In a real app, this might link to a User object
  userName: string; // Simple user identifier for display
  userAvatarUrl?: string; // Optional user avatar
  mediaUrl: string;
  mediaType: MediaType;
  description: string;
  location: Location;
  createdAt: Date;
  likes: number;
  comments: number;
}
