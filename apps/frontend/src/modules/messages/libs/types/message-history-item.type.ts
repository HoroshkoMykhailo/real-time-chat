import { type GetMessagesResponseDto } from './types.js';

type MessageHistoryItem = {
  translatedMessage?: string;
} & GetMessagesResponseDto[number];

export { type MessageHistoryItem };
