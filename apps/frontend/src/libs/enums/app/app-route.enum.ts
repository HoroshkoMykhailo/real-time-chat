const AppRoute = {
  ADMIN: '/admin',
  ANY: '*',
  CHAT: '/:id',
  CHATS: '/chats',
  PROFILE: '/profile',
  ROOT: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up'
} as const;

export { AppRoute };
