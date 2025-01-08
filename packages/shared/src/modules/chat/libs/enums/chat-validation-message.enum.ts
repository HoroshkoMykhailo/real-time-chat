import { ChatValidationRule } from './chat-validation-rule.enum.js';

const ChatValidationMessage = {
  EMPTY_BODY: 'Please provide at least one field to proceed.',
  GROUP_PICTURE_VALIDATION_ERROR: 'The group picture must be a valid object.',
  MEMBERS_INVALID: 'One or more selected members are invalid.',
  MEMBERS_REQUIRED: `You must select at least ${ChatValidationRule.MEMBERS_MIN_COUNT} member(s).`,
  NAME_EMPTY: 'The group name cannot be empty.',
  NAME_MAX_LENGTH: `The group name cannot exceed ${ChatValidationRule.NAME_MAX_LENGTH} characters.`,
  TYPE_EMPTY: 'The chat type cannot be empty.',
  TYPE_INVALID: 'The selected chat type is invalid.'
} as const;

export { ChatValidationMessage };
