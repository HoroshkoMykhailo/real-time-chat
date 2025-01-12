import React from 'react';

import { ChatPicture, FileIcon, Image } from '~/libs/components/components.js';
import { ENV } from '~/libs/enums/enums.js';
import { ChatType } from '~/modules/chat/chat.js';
import { type Chats } from '~/modules/chat/libs/types/types.js';
import { MessageType } from '~/modules/messages/message.js';

import styles from '../../../styles.module.scss';
import { formatLastMessageTime } from '../../helpers/format-last-message-time.js';

type Properties = {
  chat: Chats[number];
};

const MESSAGE_CONTENT = 'message-content';

const ChatItem: React.FC<Properties> = ({
  chat: { chatPicture, draft, lastMessage, name, type }
}) => {
  const isFile = lastMessage?.type === MessageType.FILE;
  const isImage = lastMessage?.type === MessageType.IMAGE;
  let imageUrl = '';

  if (isImage) {
    imageUrl = `${ENV.SERVER_URL}${lastMessage.fileUrl}`;
  }

  const groupMessageContent =
    type === ChatType.GROUP && lastMessage?.senderName ? (
      <>
        <span className={styles['sender-name']}>{lastMessage.senderName}:</span>
        {isFile ? <FileIcon height={15} width={15} /> : null}
        {isImage ? (
          <>
            <Image
              alt={lastMessage.content}
              className={styles['message-image'] ?? ''}
              src={imageUrl}
            />
            <span className={styles[MESSAGE_CONTENT]}>Image</span>
          </>
        ) : (
          <span className={styles[MESSAGE_CONTENT]}>{lastMessage.content}</span>
        )}
      </>
    ) : (
      <>
        {isFile ? <FileIcon height={15} width={15} /> : null}
        {isImage ? (
          <>
            <Image
              alt={lastMessage.content}
              className={styles['message-image'] ?? ''}
              src={imageUrl}
            />
            <span className={styles[MESSAGE_CONTENT]}>Image</span>
          </>
        ) : (
          <p className={styles[MESSAGE_CONTENT]}>{lastMessage?.content}</p>
        )}
      </>
    );

  const lastMessageTime = lastMessage?.createdAt
    ? formatLastMessageTime(lastMessage.createdAt)
    : '';

  return (
    <div className={styles['chat-item-content']}>
      <ChatPicture isCircular name={name} picture={chatPicture} />
      <div className={styles['chat-info']}>
        <p className={styles['chat-name']}>{name}</p>
        <div className={styles['chat-message']}>
          {draft ? (
            <>
              <span className={styles['message-draft']}>Draft: </span>
              <span className={styles[MESSAGE_CONTENT]}>{draft.content}</span>
            </>
          ) : (
            groupMessageContent
          )}
        </div>
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
