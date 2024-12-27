import { type Message } from '~/modules/message/message.js';
import { type Profile } from '~/modules/profile/profile.js';

type ChatGetResponseDto = {
  adminId?: string;
  members: Profile[];
  messages: Message[];
};

export { type ChatGetResponseDto };
