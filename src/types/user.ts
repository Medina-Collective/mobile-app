import type { UserRole } from '@constants/index';


export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
}
