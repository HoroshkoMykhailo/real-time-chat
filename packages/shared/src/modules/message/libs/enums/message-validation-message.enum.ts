const MessageValidationMessage = {
  EMPTY_BODY: 'At least one field must be provided.',
  FILE_VALIDATION_ERROR: 'File is required.',
  TEXT_CONTENT_MAX_LENGTH: 'Content must be no more than 500 characters long.',
  TEXT_CONTENT_MIN_LENGTH: 'Content must be at least 1 character long.',
  TEXT_CONTENT_REQUIRE: 'Content is required.'
} as const;

export { MessageValidationMessage };
