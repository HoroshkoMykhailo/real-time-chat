import { type ValueOf } from '~/libs/types/types.js';
import { type MessageLanguage } from '~/modules/message/message.js';

type TranslationService = {
  translate: (
    text: string,
    language: ValueOf<typeof MessageLanguage>
  ) => Promise<string>;
};

export { type TranslationService };
