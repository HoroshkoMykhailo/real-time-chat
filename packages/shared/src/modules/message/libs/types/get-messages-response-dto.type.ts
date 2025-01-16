import { type MessageCreationResponseDto } from './types.js';

type GetMessagesResponseDto = {
  lastViewedTime?: string;
  messages: MessageCreationResponseDto[];
};

export { type GetMessagesResponseDto };
