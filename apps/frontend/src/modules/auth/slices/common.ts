const ActionType = {
  GET_USER: 'auth/get-user',
  LOGOUT: 'auth/logout',
  SIGN_IN: 'auth/sign-in',
  SIGN_UP: 'auth/sign-up'
} as const;

export { ActionType };
