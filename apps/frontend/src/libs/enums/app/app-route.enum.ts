const AppRoute = {
  ADMIN: '/admin',
  ANY: '*',
  CHAT: '/:id',
  CHATS: '/chats',
  GOOGLE_OAUTH_CALLBACK: '/auth/google/callback',
  PROFILE: '/profile',
  ROOT: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up'
} as const;

export { AppRoute };
