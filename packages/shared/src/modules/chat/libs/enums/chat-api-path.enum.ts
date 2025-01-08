const ChatApiPath = {
  $CHAT_ID: '/:id',
  $MEMBER_ID: '/:memberId',
  MEMBERS: '/members',
  MY_GROUPS: '/my-groups',
  ROOT: '/'
} as const;

export { ChatApiPath };
