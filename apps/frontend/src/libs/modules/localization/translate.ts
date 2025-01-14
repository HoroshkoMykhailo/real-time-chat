import { translations } from './libs/translations.js';
import { Translation as TranslationService } from './translation.module.js';

const translate = new TranslationService({
  translations
});

export { translate };
