import { getGcsClient } from './gcs-client.helper.js';
import { tryParseGcsHttpUrl } from './parse-gcs-http-url.helper.js';

const downloadGcsObjectByHttpUrl = async (fileUrl: string): Promise<Buffer> => {
  const parsed = tryParseGcsHttpUrl(fileUrl);

  if (!parsed) {
    throw new Error('Not a Google Cloud Storage object URL');
  }

  const bucket = getGcsClient().bucket(parsed.bucket);
  const [contents] = await bucket.file(parsed.objectName).download();

  return contents;
};

export { downloadGcsObjectByHttpUrl };
