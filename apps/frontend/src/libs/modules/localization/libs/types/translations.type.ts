import { type ValueOf } from '~/libs/types/types.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';

type Translations = {
  [key in ValueOf<typeof ProfileLanguage>]: {
    [key: string]: string;
  };
};

export { type Translations };
