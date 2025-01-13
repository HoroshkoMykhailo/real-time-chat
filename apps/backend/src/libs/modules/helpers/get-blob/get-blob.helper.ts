import mime from 'mime-types';
import fs from 'node:fs/promises';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { staticPath } from '../../constants/constants.js';
import { joinPath } from '../../path/path.js';

const getBlob = async (filePath: string): Promise<Blob> => {
  try {
    const fullPath = joinPath([staticPath, filePath]);
    const fileBuffer = await fs.readFile(fullPath);
    const fileExtension = filePath.split('.').pop();
    const mimeType =
      mime.lookup(fileExtension ?? '') || 'application/octet-stream';

    return new Blob([fileBuffer], { type: mimeType });
  } catch {
    throw new HTTPError({
      message: ExceptionMessage.FILE_NOT_FOUND,
      status: HTTPCode.NOT_FOUND
    });
  }
};

export { getBlob };
