import { useState, useCallback } from 'react';

interface ProfileUpdateRequest {
  nickname?: string;
  profileImage?: string;
}

interface UserProfile {
  userIdx: string;
  email: string;
  nickname: string;
  profileImage?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

interface ImageUploadResponse {
  success: boolean;
  data: {
    id: number;
    url: string;
    mediaType: string;
  };
}

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const updateProfile = useCallback(async (updateData: ProfileUpdateRequest): Promise<ProfileUpdateResponse> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다');
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로필 업데이트에 실패했습니다');
      }

      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadProfileImage = useCallback(async (file: File): Promise<string> => {
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다');
      }

      // 파일 크기 검사 (클라이언트 사이드)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB 이하여야 합니다');
      }

      // 파일 형식 검사
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('JPG, PNG, WEBP 형식만 지원됩니다');
      }

      const formData = new FormData();
      formData.append('file', file);

      // 업로드 진행률 시뮬레이션 (실제로는 XMLHttpRequest 사용)
      const uploadPromise = fetch('/api/media/upload/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await uploadPromise;
      clearInterval(progressInterval);
      setUploadProgress(100);

      const data: ImageUploadResponse = await response.json();

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다');
      }

      if (!data.success) {
        throw new Error('이미지 업로드에 실패했습니다');
      }

      // S3 URL 직접 사용 (프록시 URL 제거)
      return data.data.url;
    } catch (error) {
      setUploadProgress(0);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNickname = useCallback(async (nickname: string): Promise<UserProfile> => {
    const response = await updateProfile({ nickname });
    return response.user;
  }, [updateProfile]);

  const updateProfileImageUrl = useCallback(async (profileImage: string): Promise<UserProfile> => {
    const response = await updateProfile({ profileImage });
    return response.user;
  }, [updateProfile]);

  return {
    isLoading,
    uploadProgress,
    updateProfile,
    updateNickname,
    updateProfileImageUrl,
    uploadProfileImage,
  };
};
