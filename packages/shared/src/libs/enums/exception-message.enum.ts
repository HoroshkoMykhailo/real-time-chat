const ExceptionMessage = {
  EMAIL_USED: 'Email address is already in use.',
  ERROR_SAVING_IMAGE: 'Error saving image.',
  ERROR_UPDATING_PROFILE: 'Error updating profile.',
  FORBIDDEN: 'This action is forbidden.',
  GROUP_NAME_REQUIRED: 'Group name is required.',
  GROUP_NOT_FOUND: 'Group not found.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  INVALID_DATE_OF_BIRTH: 'Invalid date of birth.',
  INVALID_IMAGE_TYPE: 'Invalid image type.',
  INVALID_TOKEN: 'Invalid token.',
  INVALID_TOKEN_NO_USER_ID: 'Token is invalid: userId missing.',
  MEMBER_NOT_FOUND: 'Member not found.',
  NO_TOKEN_PROVIDED: 'No token provided.',
  NOT_VALID_MEMBERS_COUNT: 'Not valid members count.',
  NOTIFICATION_NOT_FOUND: 'Notification not found.',
  PROFILE_NOT_FOUND: 'Profile not found.',
  TOKEN_EXPIRED: 'Token is expired.',
  USER_NOT_FOUND: 'User not found.'
} as const;

export { ExceptionMessage };
