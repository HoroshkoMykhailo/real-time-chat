import { type MultipartFile } from '@fastify/multipart';

type FileMessageRequestDto = {
  file: MultipartFile;
};

export { type FileMessageRequestDto };
