import { type MultipartFile } from '@fastify/multipart';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { saveFile } from '../helpers.js';

const saveAudio = async (file: MultipartFile): Promise<string> => {
  const mimeType = file.mimetype;

  if (!mimeType.startsWith('audio/')) {
    throw new HTTPError({
      message: ExceptionMessage.INVALID_IMAGE_TYPE,
      status: HTTPCode.BAD_REQUEST
    });
  }

  return await saveFile(file, mimeType, 'audio-');
};

export { saveAudio };
