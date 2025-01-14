import { type ValueOf } from '~/libs/types/types.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';

type TranslationService = {
  translate(key: string, lang: ValueOf<typeof ProfileLanguage>): string;
};

export { type TranslationService };
