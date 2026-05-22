const ChatApiPath = {
  $CHAT_ID: '/:id',
  $MEMBER_ID: '/:memberId',
  LAST_VIEWED_TIME: '/last-viewed-time',
  MEMBERS: '/members',
  MY_GROUPS: '/my-groups',
  ROOT: '/',
  SUMMARY: '/summary'
} as const;

export { ChatApiPath };
