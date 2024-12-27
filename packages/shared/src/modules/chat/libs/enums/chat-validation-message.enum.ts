import { ChatValidationRule } from './chat-validation-rule.enum.js';

const ChatValidationMessage = {
  EMPTY_BODY: 'At least one field must be provided.',
  GROUP_PICTURE_VALIDATION_ERROR: 'Group picture validation error',
  MEMBERS_INVALID: 'Members validation error',
  MEMBERS_REQUIRED: 'Members validation error',
  NAME_EMPTY: 'Name validation error',
  NAME_MAX_LENGTH: `Name validation error. Max length: ${ChatValidationRule.NAME_MAX_LENGTH}`,
  TYPE_EMPTY: 'Type validation error',
  TYPE_INVALID: 'Type validation error'
} as const;

export { ChatValidationMessage };
