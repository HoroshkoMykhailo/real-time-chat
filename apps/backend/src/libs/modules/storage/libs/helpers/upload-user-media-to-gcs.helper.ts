import mime from 'mime-types';

import { config } from '~/libs/modules/config/config.js';

import { buildGcsPublicUrl } from './build-gcs-public-url.helper.js';
import { getGcsClient } from './gcs-client.helper.js';

const uploadUserMediaToGcs = async (
  data: Uint8Array,
  mimeType: string,
  prefix: string
): Promise<string> => {
  const bucketName = config.ENV.GOOGLE_CLOUD.STORAGE_BUCKET.trim();
  const fileExtension = mime.extension(mimeType);
  const objectName = `chat-media/${prefix}${Date.now()}.${fileExtension || 'bin'}`;
  const bucket = getGcsClient().bucket(bucketName);

  await bucket.file(objectName).save(Buffer.from(data), {
    contentType: mimeType,
    metadata: { cacheControl: 'public, max-age=31536000' },
    resumable: false
  });

  return buildGcsPublicUrl(bucketName, objectName);
};

export { uploadUserMediaToGcs };
