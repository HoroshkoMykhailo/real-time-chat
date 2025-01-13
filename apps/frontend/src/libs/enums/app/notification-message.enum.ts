const NotificationMessage = {
  CHAT_CREATED: 'Private chat created',
  CHAT_LEFT: 'Chat left',
  GROUP_CREATED: 'Group created',
  GROUP_DELETED: 'Group deleted',
  GROUP_UPDATED: 'Group updated',
  MEMBER_REMOVED: 'Member removed',
  MEMBERS_ADDED: 'Members added',
  MESSAGE_COPIED: 'Text copied',
  MESSAGE_TRANSCRIBED: 'Message transcribed',
  MESSAGE_TRANSLATED: 'Message translated'
} as const;

export { NotificationMessage };
