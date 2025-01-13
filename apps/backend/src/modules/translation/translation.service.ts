import { ExceptionMessage } from '~/libs/enums/enums.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type MessageLanguage } from '../message/message.js';
import {
  type TranslationService,
  type TranslationServiceClient
} from './libs/types/types.js';

const DEFAULT_VALUE = 0;

type Constructor = {
  parent: string;
  translationClient: TranslationServiceClient;
};

class Translation implements TranslationService {
  #parent: string;
  #translationClient: TranslationServiceClient;

  public constructor({ parent, translationClient }: Constructor) {
    this.#parent = parent;
    this.#translationClient = translationClient;
  }

  public async translate(
    text: string,
    language: ValueOf<typeof MessageLanguage>
  ): Promise<string> {
    try {
      const [response] = await this.#translationClient.translateText({
        contents: [text],
        parent: this.#parent,
        targetLanguageCode: language as string
      });

      const { translations } = response;

      if (
        translations &&
        translations[DEFAULT_VALUE] &&
        translations[DEFAULT_VALUE].translatedText
      ) {
        return translations[DEFAULT_VALUE].translatedText;
      } else {
        throw new HTTPError({
          message: ExceptionMessage.NO_TRANSLATION_AVAILABLE,
          status: HTTPCode.NOT_FOUND
        });
      }
    } catch {
      throw new HTTPError({
        message: ExceptionMessage.TRANSLATION_ERROR,
        status: HTTPCode.INTERNAL_SERVER_ERROR
      });
    }
  }
}

export { Translation };
