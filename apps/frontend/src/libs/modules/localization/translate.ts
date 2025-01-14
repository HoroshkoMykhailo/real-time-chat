import { type ValueOf } from '~/libs/types/types.js';
import { ProfileLanguage } from '~/modules/profile/libs/types/types.js';

import { translations } from './libs/translations.js';

const translate = (
  key: string,
  lang: ValueOf<typeof ProfileLanguage> = ProfileLanguage.ENGLISH
): string => {
  return translations[lang][key] ?? key;
};

export { translate };
