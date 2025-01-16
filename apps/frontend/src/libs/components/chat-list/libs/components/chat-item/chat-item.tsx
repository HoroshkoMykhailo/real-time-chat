import React from 'react';

import { ZERO_VALUE } from '~/libs/common/constants.js';
import { ChatPicture, MessagePreview } from '~/libs/components/components.js';
import { type Chats } from '~/modules/chat/libs/types/types.js';

import styles from '../../../styles.module.scss';
import { formatLastMessageTime } from '../../helpers/format-last-message-time.js';

type Properties = {
  chat: Chats[number];
};

const MESSAGE_CONTENT = 'message-content';

const ChatItem: React.FC<Properties> = ({
  chat: { chatPicture, draft, lastMessage, name, type, unreadCount }
}) => {
  const lastMessageTime = lastMessage?.createdAt
    ? formatLastMessageTime(lastMessage.createdAt)
    : '';

  return (
    <div className={styles['chat-item-content']}>
      <ChatPicture isCircular name={name} picture={chatPicture} />
      <div className={styles['chat-info']}>
        <div className={styles['chat-name-wrapper']}>
          <p className={styles['chat-name']}>{name}</p>
          {unreadCount !== ZERO_VALUE && (
            <div className={styles['unread-count']}>{unreadCount}</div>
          )}
        </div>
        <div className={styles['chat-message']}>
          <div className={styles['message-preview']}>
            {draft ? (
              <>
                <span className={styles['message-draft']}>Draft: </span>
                <span className={styles[MESSAGE_CONTENT]}>{draft.content}</span>
              </>
            ) : (
              <MessagePreview message={lastMessage} type={type} />
            )}
          </div>
          <div className={styles['chat-time']}>
            {draft?.createdAt
              ? formatLastMessageTime(draft.createdAt)
              : lastMessageTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ChatItem };
