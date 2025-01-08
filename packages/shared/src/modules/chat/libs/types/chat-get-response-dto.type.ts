import { type Profile } from '~/modules/profile/profile.js';

type ChatGetResponseDto = {
  adminId?: string;
  members: Profile[];
};

export { type ChatGetResponseDto };
