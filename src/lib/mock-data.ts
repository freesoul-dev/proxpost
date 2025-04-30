import type { Post } from './types';
import type { Location } from '@/services/location';

// Helper function to create a location slightly offset from a base location
const createNearbyLocation = (baseLoc: Location, offsetLat: number, offsetLng: number): Location => ({
  lat: baseLoc.lat + offsetLat,
  lng: baseLoc.lng + offsetLng,
});

const baseLocation: Location = { lat: 34.0522, lng: -118.2437 }; // Los Angeles

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Alice',
    userAvatarUrl: 'https://picsum.photos/seed/user1/40/40',
    mediaUrl: 'https://picsum.photos/seed/post1/600/400',
    mediaType: 'image',
    description: 'Beautiful sunset view from Griffith Observatory!',
    location: createNearbyLocation(baseLocation, 0.05, -0.02), // Approx 3-4 miles away
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    likes: 15,
    comments: 3,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Bob',
    userAvatarUrl: 'https://picsum.photos/seed/user2/40/40',
    // Placeholder video URL - replace with actual video if possible
    mediaUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    mediaType: 'video',
    description: 'Street performers at Santa Monica Pier.',
    location: createNearbyLocation(baseLocation, -0.1, -0.3), // Approx 15-20 miles away
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    likes: 28,
    comments: 7,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Charlie',
    // Placeholder audio URL - replace with actual audio if possible
    mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    mediaType: 'audio',
    description: 'Cool music playing in Echo Park.',
    location: createNearbyLocation(baseLocation, 0.02, 0.01), // Approx 1-2 miles away
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    likes: 8,
    comments: 1,
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Diana',
    userAvatarUrl: 'https://picsum.photos/seed/user4/40/40',
    mediaUrl: 'https://picsum.photos/seed/post4/600/800',
    mediaType: 'image',
    description: 'Amazing tacos downtown!',
    location: createNearbyLocation(baseLocation, 0.005, -0.005), // Very close
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    likes: 42,
    comments: 11,
  },
   {
    id: '5',
    userId: 'user5',
    userName: 'Eve',
    mediaUrl: 'https://picsum.photos/seed/post5/700/500',
    mediaType: 'image',
    description: 'Hiking in the hills near the city.',
    location: createNearbyLocation(baseLocation, 0.15, 0.1), // Approx 10-12 miles away
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    likes: 33,
    comments: 5,
  },
   {
    id: '6', // Far away post
    userId: 'user6',
    userName: 'Frank',
    mediaUrl: 'https://picsum.photos/seed/post6/500/500',
    mediaType: 'image',
    description: 'Greetings from San Francisco!',
    location: { lat: 37.7749, lng: -122.4194 }, // San Francisco (outside 50 miles)
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    likes: 101,
    comments: 25,
  },
];
