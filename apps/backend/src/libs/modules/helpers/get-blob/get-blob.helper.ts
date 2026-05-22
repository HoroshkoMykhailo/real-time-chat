import mime from 'mime-types';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { readUploadedMediaBuffer } from '../read-uploaded-media-buffer/read-uploaded-media-buffer.helper.js';

const LAST_DOT_NOT_FOUND = -1;
const EXTENSION_START_OFFSET = 1;

const getBlob = async (filePath: string): Promise<Blob> => {
  try {
    const fileBuffer = await readUploadedMediaBuffer(filePath);
    const [pathWithoutQuery = filePath] = filePath.split('?');
    const lastDotIndex = pathWithoutQuery.lastIndexOf('.');

    const fileExtension =
      lastDotIndex === LAST_DOT_NOT_FOUND
        ? ''
        : pathWithoutQuery.slice(lastDotIndex + EXTENSION_START_OFFSET);
    const mimeType = mime.lookup(fileExtension) || 'application/octet-stream';

    return new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
  } catch {
    throw new HTTPError({
      message: ExceptionMessage.FILE_NOT_FOUND,
      status: HTTPCode.NOT_FOUND
    });
  }
};

export { getBlob };
