import { type MultipartFile, type MultipartValue } from '@fastify/multipart';

type ChatUpdateRequestDto = {
  groupPicture?: MultipartFile;
  name?: MultipartValue<string>;
};

export { type ChatUpdateRequestDto };
