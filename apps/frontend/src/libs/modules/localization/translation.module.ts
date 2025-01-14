import { type ValueOf } from '~/libs/types/types.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';

import {
  type TranslationService,
  type Translations
} from './libs/types/types.js';

type Constructor = {
  translations: Translations;
};

class Translation implements TranslationService {
  #translations: Translations;

  public constructor({ translations }: Constructor) {
    this.#translations = translations;
  }

  public translate(key: string, lang: ValueOf<typeof ProfileLanguage>): string {
    return this.#translations[lang][key] ?? key;
  }
}

export { Translation };
