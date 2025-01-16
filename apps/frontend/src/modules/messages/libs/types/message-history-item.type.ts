import { type MessageCreationResponseDto } from './types.js';

type MessageHistoryItem = {
  translatedMessage?: string;
} & MessageCreationResponseDto;

export { type MessageHistoryItem };
