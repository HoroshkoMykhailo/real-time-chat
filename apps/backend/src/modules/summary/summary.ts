import { config } from '~/libs/modules/config/config.js';

import { Summary as SummaryService } from './summary.service.js';

const summaryService = new SummaryService({ config });

export { summaryService };
export { type Summary as SummaryService } from './summary.service.js';
