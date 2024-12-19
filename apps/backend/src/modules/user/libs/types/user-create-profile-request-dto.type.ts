import { type MultipartFile } from '@fastify/multipart';
import { type UserProfileCreationRequestDto as OriginalUserProfileCreationRequestDto } from '@team-link/shared';

type UserProfileCreationRequestDto = {
  profilePicture?: MultipartFile;
} & OriginalUserProfileCreationRequestDto;

export { type UserProfileCreationRequestDto };
