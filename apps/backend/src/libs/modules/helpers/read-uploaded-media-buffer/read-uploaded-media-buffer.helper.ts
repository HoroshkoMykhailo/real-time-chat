import fs from 'node:fs/promises';

import { staticPath } from '../../constants/constants.js';
import { joinPath } from '../../path/path.js';
import {
  downloadGcsObjectByHttpUrl,
  tryParseGcsHttpUrl
} from '../../storage/storage.js';

const readUploadedMediaBuffer = async (fileUrl: string): Promise<Buffer> => {
  if (tryParseGcsHttpUrl(fileUrl)) {
    return await downloadGcsObjectByHttpUrl(fileUrl);
  }

  const fullPath = joinPath([staticPath, fileUrl]);

  return await fs.readFile(fullPath);
};

export { readUploadedMediaBuffer };
