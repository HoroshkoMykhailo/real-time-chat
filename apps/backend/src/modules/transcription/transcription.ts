import { TranscriptionServiceClient } from './libs/types/types.js';
import { Transcription as TranscriptionService } from './transcription.service.js';

const transcriptionClient = new TranscriptionServiceClient();

const transcriptionService = new TranscriptionService({
  transcriptionClient
});

export { transcriptionService };
export { type Transcription as TranscriptionService } from './transcription.service.js';
