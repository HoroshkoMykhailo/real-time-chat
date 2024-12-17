import { config } from '../config/config.js';
import { logger } from '../logger/logger.js';
import { Database } from './database.module.js';

const database = new Database({ config, logger });

export { database };
export { type AbstractDocument, AbstractSchema } from './abstract.document.js';
export { Abstract as AbstractRepository } from './abstract.repository.js';
export { DatabaseCollectionName } from './libs/enums/enums.js';
export { type DatabaseModule, type Repository } from './libs/types/types.js';
