/* eslint-disable sonarjs/no-hardcoded-passwords -- HTTP multipart field names only */
const UserPayloadKey = {
  CONFIRM_PASSWORD: 'confirmPassword',
  DATE_OF_BIRTH: 'dateOfBirth',
  DESCRIPTION: 'description',
  EMAIL: 'email',
  LANGUAGE: 'language',
  PASSWORD: 'password',
  PROFILE_PICTURE: 'profilePicture',
  STATUS: 'status',
  TOKEN: 'token',
  USERNAME: 'username'
} as const;

export { UserPayloadKey };
