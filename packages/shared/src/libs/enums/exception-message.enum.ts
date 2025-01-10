const ExceptionMessage = {
  CHAT_IS_PRIVATE: 'Chat is private.',
  CHAT_NOT_FOUND: 'Chat not found.',
  EMAIL_USED: 'Email address is already in use.',
  ERROR_SAVING_IMAGE: 'Error saving image.',
  ERROR_UPDATING_PROFILE: 'Error updating profile.',
  FORBIDDEN: 'This action is forbidden.',
  GROUP_NAME_REQUIRED: 'Group name is required.',
  GROUP_NOT_FOUND: 'Group not found.',
  INVALID_CHAT_ID: 'Invalid chat id.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  INVALID_DATE_OF_BIRTH: 'Invalid date of birth.',
  INVALID_IMAGE_TYPE: 'Invalid image type.',
  INVALID_TOKEN: 'Invalid token.',
  INVALID_TOKEN_NO_USER_ID: 'Token is invalid: userId missing.',
  MEMBER_NOT_FOUND: 'Member not found.',
  MESSAGE_NOT_FOUND: 'Message not found.',
  NO_TOKEN_PROVIDED: 'No token provided.',
  NOT_VALID_MEMBERS_COUNT: 'Not valid members count.',
  NOTIFICATION_NOT_FOUND: 'Notification not found.',
  PRIVATE_CHAT_EXISTS: 'Private chat already exists.',
  PROFILE_NOT_FOUND: 'Profile not found.',
  TOKEN_EXPIRED: 'Token is expired.',
  USER_ALREADY_IN_CHAT: 'User is already in chat.',
  USER_NOT_FOUND: 'User not found.',
  USER_NOT_IN_CHAT: 'User is not in chat.'
} as const;

export { ExceptionMessage };
