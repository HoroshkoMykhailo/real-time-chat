import React from 'react';

import { ChatPicture } from '~/libs/components/components.js';
import { ChatType } from '~/modules/chat/chat.js';
import { type Chats } from '~/modules/chat/libs/types/types.js';

import styles from '../../../styles.module.scss';
import { formatLastMessageTime } from '../../helpers/format-last-message-time.js';

type Properties = {
  chat: Chats[number];
};

const MESSAGE_CONTENT = 'message-content';

const ChatItem: React.FC<Properties> = ({
  chat: { chatPicture, draft, lastMessage, name, type }
}) => {
  const groupMessageContent =
    type === ChatType.GROUP && lastMessage?.senderName ? (
      <>
        <span className={styles['sender-name']}>{lastMessage.senderName}:</span>
        <span className={styles[MESSAGE_CONTENT]}>{lastMessage.content}</span>
      </>
    ) : (
      <span className={styles[MESSAGE_CONTENT]}>{lastMessage?.content}</span>
    );

  const lastMessageTime = lastMessage?.createdAt
    ? formatLastMessageTime(lastMessage.createdAt)
    : '';

  return (
    <div className={styles['chat-item-content']}>
      <ChatPicture isCircular name={name} picture={chatPicture} />
      <div className={styles['chat-info']}>
        <p className={styles['chat-name']}>{name}</p>
        <p className={styles['chat-message']}>
          {draft ? (
            <>
              <span className={styles['message-draft']}>Draft: </span>
              <span className={styles[MESSAGE_CONTENT]}>{draft.content}</span>
            </>
          ) : (
            groupMessageContent
          )}
        </p>
      </div>
      <div className={styles['chat-time']}>
        {draft?.createdAt
          ? formatLastMessageTime(draft.createdAt)
          : lastMessageTime}
      </div>
    </div>
  );
};

export { ChatItem };
