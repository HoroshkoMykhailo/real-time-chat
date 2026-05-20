import { type MessageCreationResponseDto } from './types.js';

type MessageHistoryItem = MessageCreationResponseDto & {
  translatedMessage?: string;
};

export { type MessageHistoryItem };
