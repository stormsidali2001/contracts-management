import { BASE_URL } from '@/api/axios';

const ROLE_AVATARS: Record<string, string> = {
  ADMIN: '/avatars/default-admin.png',
  EMPLOYEE: '/avatars/default-employee.png',
  JURIDICAL: '/avatars/default-juridical.png',
};

export const getRoleAvatar = (role: string | undefined | null): string =>
  ROLE_AVATARS[role ?? ''] ?? '/blank-profile-picture.png';

export const getAvatarSrc = (
  imageUrl: string | undefined | null,
  role: string | undefined | null,
): string => {
  if (!imageUrl || imageUrl.startsWith('default-')) return getRoleAvatar(role);
  return `${BASE_URL}/users/image/${imageUrl}`;
};
