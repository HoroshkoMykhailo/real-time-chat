import { config } from '../config/config.js';

const googleCloudParent = `projects/${config.ENV.GOOGLE_CLOUD.PROJECT_ID}/locations/global`;

export { googleCloudParent };
