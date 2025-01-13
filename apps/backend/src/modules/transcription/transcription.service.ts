import fs from 'node:fs';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { staticPath } from '~/libs/modules/constants/constants.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { joinPath } from '~/libs/modules/path/path.js';

import {
  type TranscriptionService,
  type TranscriptionServiceClient
} from './libs/types/types.js';

const DEFAULT_VALUE = 0;
const RATE_HERTZ = 48_000;

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
      const fullPath = joinPath([staticPath, audioFilePath]);

      const audioContent = fs.readFileSync(fullPath).toString('base64');

      const request = {
        audio: {
          content: audioContent
        },
        config: {
          alternativeLanguageCodes: ['uk-UA'],
          encoding: 9,
          languageCode: 'en-US',
          rateHertz: RATE_HERTZ
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
        .map(result => result.alternatives?.[DEFAULT_VALUE]?.transcript ?? '')
        .join(' ')
        .trim();

      if (!transcription) {
        throw new HTTPError({
          message: ExceptionMessage.TRANSCRIPTION_ERROR,
          status: HTTPCode.INTERNAL_SERVER_ERROR
        });
      }

      return transcription;
    } catch {
      throw new HTTPError({
        message: ExceptionMessage.TRANSCRIPTION_ERROR,
        status: HTTPCode.INTERNAL_SERVER_ERROR
      });
    }
  }
}

export { Transcription };
