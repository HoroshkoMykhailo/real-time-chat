import fs from 'node:fs/promises';

import { config } from '~/libs/modules/config/config.js';
import { staticPath } from '~/libs/modules/constants/constants.js';
import { joinPath } from '~/libs/modules/path/path.js';

import { getGcsClient } from './gcs-client.helper.js';
import { tryParseGcsHttpUrl } from './parse-gcs-http-url.helper.js';

const deleteStoredUserMedia = async (fileUrl: string): Promise<void> => {
  const trimmed = fileUrl.trim();

  if (!trimmed) {
    return;
  }

  const gcs = tryParseGcsHttpUrl(trimmed);

  if (gcs) {
    const configuredBucket = config.ENV.GOOGLE_CLOUD.STORAGE_BUCKET.trim();

    if (!configuredBucket || gcs.bucket !== configuredBucket) {
      return;
    }

    await getGcsClient()
      .bucket(gcs.bucket)
      .file(gcs.objectName)
      .delete({ ignoreNotFound: true });

    return;
  }

  if (!trimmed.startsWith('/')) {
    return;
  }

  const fullPath = joinPath([staticPath, trimmed]);

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    const { code } = error as { code?: string };

    if (code !== 'ENOENT') {
      throw error;
    }
  }
};

export { deleteStoredUserMedia };
