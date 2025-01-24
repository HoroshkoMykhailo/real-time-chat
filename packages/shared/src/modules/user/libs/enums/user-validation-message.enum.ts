import { UserValidationRule } from './user-validation-rule.enum.js';

const UserValidationMessage = {
  CONFIRM_PASSWORD_MATCH: 'Passwords do not match',
  CONFIRM_PASSWORD_REQUIRE: 'Confirm password is required',
  EMAIL_REQUIRE: 'Email is required',
  EMAIL_WRONG: 'Email is wrong',
  PASSWORD_MAX_LENGTH: `Password must be at most ${UserValidationRule.PASSWORD_MAX_LENGTH} characters long`,
  PASSWORD_MIN_LENGTH: `Password must be at least ${UserValidationRule.PASSWORD_MIN_LENGTH} characters long`,
  PASSWORD_REQUIRE: 'Password is required',
  TOKEN_REQUIRE: 'Token is required',
  USERNAME_MAX_LENGTH: `Username must be at most ${UserValidationRule.USERNAME_MAX_LENGTH} characters long`,
  USERNAME_MIN_LENGTH: `Username must be at least ${UserValidationRule.USERNAME_MIN_LENGTH} characters long`,
  USERNAME_REQUIRE: 'Username is required'
} as const;

export { UserValidationMessage };
