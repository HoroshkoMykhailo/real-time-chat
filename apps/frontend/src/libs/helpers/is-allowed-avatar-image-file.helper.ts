const BYTES_PER_KIBIBYTE = 1024;
const MAX_AVATAR_INPUT_MEGABYTES = 15;
const AVATAR_MAX_INPUT_BYTES =
  MAX_AVATAR_INPUT_MEGABYTES * BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE;
const ALLOWED_AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png'
]);
const ALLOWED_AVATAR_NAME_PATTERN = /\.(jpe?g|png)$/i;

const isAllowedAvatarImageFile = (file: File): boolean => {
  if (file.size > AVATAR_MAX_INPUT_BYTES) {
    return false;
  }

  if (ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
    return true;
  }

  if (!file.type && ALLOWED_AVATAR_NAME_PATTERN.test(file.name)) {
    return true;
  }

  return false;
};

export { isAllowedAvatarImageFile };
