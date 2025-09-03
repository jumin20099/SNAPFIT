// 사용자 엔티티 타입 정의
export interface User {
  userIdx: number;
  userName: string;
  userProfileImage?: string;
  userBio?: string;
  email?: string;
  followerCount: number;
  followingCount: number;
  postCount?: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  user: User;
  posts: any[]; // Post 타입은 별도 엔티티에서 정의
  likedProducts: any[]; // Product 타입은 별도 엔티티에서 정의
  followers: User[];
  following: User[];
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showFollowers: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'ko' | 'en';
  };
}

// 사용자 관련 비즈니스 로직
export const UserUtils = {
  getDisplayName: (user: User): string => {
    return user.userName || '익명 사용자';
  },

  getProfileImageUrl: (user: User): string => {
    if (user.userProfileImage) {
      if (user.userProfileImage.startsWith('http')) {
        return user.userProfileImage;
      }
      return `${process.env.NEXT_PUBLIC_CDN_URL || ''}${user.userProfileImage}`;
    }
    return '/default-avatar.png';
  },

  getInitials: (user: User): string => {
    const name = user.userName || '익명';
    return name.charAt(0).toUpperCase();
  },

  isVerified: (user: User): boolean => {
    // 인증 로직 구현
    return false;
  },

  getFollowersText: (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  },
};
