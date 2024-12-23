import { ProfileValidationRule } from './profile-validation-rule.enum.js';

const ProfileValidationMessage = {
  DATE_OF_BIRTH_EMPTY: 'Date of birth cannot be empty.',
  DATE_OF_BIRTH_INVALID: 'Date of birth must be in the format dd.mm.yyyy.',
  DESCRIPTION_EMPTY: 'Description cannot be empty.',
  DESCRIPTION_MAX_LENGTH: `Description must not exceed ${ProfileValidationRule.DESCRIPTION_MAX_LENGTH} characters.`,
  EMPTY_BODY: 'At least one field must be provided.',
  LANGUAGE_EMPTY: 'Language cannot be empty.',
  LANGUAGE_INVALID: 'Language must be one of the predefined values.',
  PROFILE_PICTURE_VALIDATION_ERROR:
    'Profile picture must be a valid image file.',
  USERNAME_EMPTY: 'Username cannot be empty.',
  USERNAME_MAX_LENGTH: `Username must be at most ${ProfileValidationRule.USERNAME_MAX_LENGTH} characters long.`,
  USERNAME_MIN_LENGTH: `Username must be at least ${ProfileValidationRule.USERNAME_MIN_LENGTH} characters long.`
} as const;

export { ProfileValidationMessage };
