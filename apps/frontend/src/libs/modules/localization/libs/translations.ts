import { type ValueOf } from '~/libs/types/types.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';

type Language = ValueOf<typeof ProfileLanguage>;

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    profileDetails: 'Profile Details'
  },
  uk: {
    profileDetails: 'Деталі профілю'
  }
};

export { translations };
