import { type MultipartFile } from '@fastify/multipart';
import mime from 'mime-types';
import fs from 'node:fs/promises';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { config } from '~/libs/modules/config/config.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { joinPath } from '~/libs/modules/path/path.js';

import { staticPath } from '../../constants/constants.js';
import { uploadUserMediaToGcs } from '../../storage/storage.js';

const saveFile = async (
  file: MultipartFile,
  mimeType: string,
  prefix: string = 'file-'
): Promise<string> => {
  const buffer = await file.toBuffer();

  const uint8Array = new Uint8Array(buffer);

  const bucketName = config.ENV.GOOGLE_CLOUD.STORAGE_BUCKET.trim();

  if (bucketName) {
    try {
      return await uploadUserMediaToGcs(uint8Array, mimeType, prefix);
    } catch {
      throw new HTTPError({
        message: ExceptionMessage.ERROR_SAVING_FILE,
        status: HTTPCode.INTERNAL_SERVER_ERROR
      });
    }
  }

  const fileExtension = mime.extension(mimeType);

  const fileName = `/${prefix}${Date.now()}.${fileExtension}`;

  const filePath = joinPath([staticPath, fileName]);

  try {
    await fs.writeFile(filePath, uint8Array);
  } catch {
    throw new HTTPError({
      message: ExceptionMessage.ERROR_SAVING_FILE,
      status: HTTPCode.INTERNAL_SERVER_ERROR
    });
  }

  return fileName;
};

export { saveFile };
