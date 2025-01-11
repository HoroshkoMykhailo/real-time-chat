import { type MultipartFile } from '@fastify/multipart';
import mime from 'mime-types';
import fs from 'node:fs';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { joinPath } from '~/libs/modules/path/path.js';

import { staticPath } from '../../constants/constants.js';

const saveFile = async (
  file: MultipartFile,
  mimeType: string,
  prefix: string = 'file-'
): Promise<string> => {
  const buffer = await file.toBuffer();

  const uint8Array = new Uint8Array(buffer);

  const fileExtension = mime.extension(mimeType);

  const fileName = `/${prefix}${Date.now()}.${fileExtension}`;

  const filePath = joinPath([staticPath, fileName]);

  fs.writeFile(filePath, uint8Array, error => {
    if (error) {
      throw new HTTPError({
        message: ExceptionMessage.ERROR_SAVING_FILE,
        status: HTTPCode.INTERNAL_SERVER_ERROR
      });
    }
  });

  return fileName;
};

export { saveFile };
