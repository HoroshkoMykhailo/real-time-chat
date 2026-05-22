import {
  type User,
  type UserProfileCreationResponseDto
} from '@team-link/shared';

type AdminUserDetail = {
  profile: UserProfileCreationResponseDto;
  user: User;
};

type AdminUserSummary = {
  createdAt: string;
  email: string;
  id: string;
  profilePicture?: string;
  role: string;
  username: string;
};

export { type AdminUserDetail, type AdminUserSummary };

export {
  type ChatGetResponseDto,
  type ChatsResponseDto,
  type GetMessagesResponseDto
} from '@team-link/shared';
