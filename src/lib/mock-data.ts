import type { Post } from './types';
import type { Location } from '@/services/location';

// Helper function to create a location slightly offset from a base location
const createNearbyLocation = (baseLoc: Location, offsetLat: number, offsetLng: number): Location => ({
  lat: baseLoc.lat + offsetLat,
  lng: baseLoc.lng + offsetLng,
});

const baseLocation: Location = { lat: 34.0522, lng: -118.2437 }; // Los Angeles

const defaultExpiry = () => new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Alice',
    userAvatarUrl: 'https://picsum.photos/seed/user1/40/40',
    mediaUrl: 'https://picsum.photos/seed/post1/600/400',
    mediaType: 'image',
    description: 'Beautiful sunset view from Griffith Observatory!',
    location: createNearbyLocation(baseLocation, 0.05, -0.02),
    createdAt: new Date(Date.now() - 1000 * 60 * 30), 
    expiresAt: defaultExpiry(),
    likes: 15,
    comments: 3,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Bob',
    userAvatarUrl: 'https://picsum.photos/seed/user2/40/40',
    mediaUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    mediaType: 'video',
    description: 'Street performers at Santa Monica Pier.',
    location: createNearbyLocation(baseLocation, -0.1, -0.3),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), 
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
    likes: 28,
    comments: 7,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Charlie',
    mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    mediaType: 'audio',
    description: 'Cool music playing in Echo Park.',
    location: createNearbyLocation(baseLocation, 0.02, 0.01),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
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
    location: createNearbyLocation(baseLocation, 0.005, -0.005),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    expiresAt: defaultExpiry(),
    likes: 42,
    comments: 11,
  },
   {
    id: '5',
    userId: 'user5',
    userName: 'Eve',
    userAvatarUrl: 'https://picsum.photos/seed/user5/40/40',
    mediaUrl: 'https://picsum.photos/seed/post5/700/500',
    mediaType: 'image',
    description: 'Hiking in the hills near the city.',
    location: createNearbyLocation(baseLocation, 0.15, 0.1),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    expiresAt: new Date(Date.now() + 168 * 60 * 60 * 1000), // 7 days
    likes: 33,
    comments: 5,
  },
   {
    id: '6', // Far away post
    userId: 'user6',
    userName: 'Frank',
    userAvatarUrl: 'https://picsum.photos/seed/user6/40/40',
    mediaUrl: 'https://picsum.photos/seed/post6/500/500',
    mediaType: 'image',
    description: 'Greetings from San Francisco!',
    location: { lat: 37.7749, lng: -122.4194 }, 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    expiresAt: defaultExpiry(),
    likes: 101,
    comments: 25,
  },
  {
    id: '7',
    userId: 'user7',
    userName: 'Grace',
    userAvatarUrl: 'https://picsum.photos/seed/user7/40/40',
    mediaType: 'text',
    textContent: 'Just saw the coolest mural on 5th street! \nHighly recommend checking it out if you are around. \n🎨✨',
    description: 'Mural Sighting',
    location: createNearbyLocation(baseLocation, 0.002, 0.001),
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    expiresAt: defaultExpiry(),
    likes: 5,
    comments: 0,
  },
  {
    id: 'expiredPost',
    userId: 'userExpired',
    userName: 'Old Timer',
    mediaType: 'text',
    textContent: 'This post should have expired already.',
    location: createNearbyLocation(baseLocation, 0.01, 0.01),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    expiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
    likes: 10,
    comments: 2,
  }
];
