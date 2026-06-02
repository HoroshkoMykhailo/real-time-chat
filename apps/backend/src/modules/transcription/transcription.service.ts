import { ExceptionMessage } from '~/libs/enums/enums.js';
import { readUploadedMediaBuffer } from '~/libs/modules/helpers/read-uploaded-media-buffer/read-uploaded-media-buffer.helper.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import {
  type TranscriptionService,
  type TranscriptionServiceClient
} from './libs/types/types.js';

const DEFAULT_VALUE = 0;

type Constructor = {
  transcriptionClient: TranscriptionServiceClient;
};

class Transcription implements TranscriptionService {
  #transcriptionClient: TranscriptionServiceClient;

  public constructor({ transcriptionClient }: Constructor) {
    this.#transcriptionClient = transcriptionClient;
  }

  public async transcribe(audioFilePath: string): Promise<string> {
    try {
      const audioBuffer = await readUploadedMediaBuffer(audioFilePath);
      const audioContent = audioBuffer.toString('base64');

      const request = {
        audio: {
          content: audioContent
        },
        config: {
          alternativeLanguageCodes: ['uk-UA'],
          languageCode: 'en-US'
        }
      };

      const [response] = await this.#transcriptionClient.recognize(request);

      const { results } = response;

      if (!results || results.length === DEFAULT_VALUE) {
        throw new HTTPError({
          message: ExceptionMessage.TRANSCRIPTION_ERROR,
          status: HTTPCode.INTERNAL_SERVER_ERROR
        });
      }

      const transcription = results
        .map(result => {
          const alternative = result.alternatives?.[DEFAULT_VALUE];

          return alternative?.transcript ?? '';
        })
        .join(' ')
        .trim();

      if (!transcription) {
        throw new HTTPError({
          message: ExceptionMessage.TRANSCRIPTION_ERROR,
          status: HTTPCode.INTERNAL_SERVER_ERROR
        });
      }

      return transcription;
    } catch (error) {
      if (error instanceof HTTPError) {
        throw error;
      }

      throw new HTTPError({
        message: ExceptionMessage.TRANSCRIPTION_ERROR,
        status: HTTPCode.INTERNAL_SERVER_ERROR
      });
    }
  }
}

export { Transcription };
