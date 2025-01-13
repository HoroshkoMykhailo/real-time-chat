import { googleCloudParent } from '~/libs/modules/constants/constants.js';

import { TranslationServiceClient } from './libs/types/types.js';
import { Translation as TranslationService } from './translation.service.js';

const translationClient = new TranslationServiceClient();

const translationService = new TranslationService({
  parent: googleCloudParent,
  translationClient
});

export { translationService };
export { type Translation as TranslationService } from './translation.service.js';
