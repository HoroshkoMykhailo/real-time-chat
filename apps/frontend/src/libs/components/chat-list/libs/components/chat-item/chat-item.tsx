import React from 'react';

import { ChatPicture } from '~/libs/components/components.js';
import { ChatType } from '~/modules/chat/chat.js';
import { type ChatsResponseDto } from '~/modules/chat/libs/types/types.js';

import styles from '../../../styles.module.scss';
import { formatLastMessageTime } from '../../helpers/format-last-message-time.js';

type Properties = {
  chat: ChatsResponseDto[number];
};

const ChatItem: React.FC<Properties> = ({
  chat: { chatPicture, lastMessage, name, type }
}) => {
  return (
    <div className={styles['chat-item-content']}>
      <ChatPicture name={name} picture={chatPicture} />
      <div className={styles['chat-info']}>
        <p className={styles['chat-name']}>{name}</p>
        <p className={styles['chat-message']}>
          {type === ChatType.GROUP && lastMessage?.senderName ? (
            <>
              <span className={styles['sender-name']}>
                {lastMessage.senderName}:
              </span>
              <span className={styles['message-content']}>
                {lastMessage.content}
              </span>
            </>
          ) : (
            <span className={styles['message-content']}>
              {lastMessage?.content}
            </span>
          )}
        </p>
      </div>
      <div className={styles['chat-time']}>
        {lastMessage?.createdAt
          ? formatLastMessageTime(lastMessage.createdAt)
          : ''}
      </div>
    </div>
  );
};

export { ChatItem };
