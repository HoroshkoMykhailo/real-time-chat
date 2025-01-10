import { Avatar } from '~/libs/components/components.js';
import { useCallback } from '~/libs/hooks/hooks.js';
import { type GetMessagesResponseDto } from '~/modules/messages/libs/types/types.js';

import { MessagePopover } from '../message-popover/message-popover.js';
import { MessageFooter } from './components/message-footer/message-footer.js';
import styles from './styles.module.scss';

type Properties = {
  message: GetMessagesResponseDto[number];
  popoverMessageId: null | string;
  setEditingMessageId: (messageId: null | string) => void;
  setPopoverMessageId: (messageId: null | string) => void;
};

const MessageItem = ({
  message,
  popoverMessageId,
  setEditingMessageId,
  setPopoverMessageId
}: Properties): JSX.Element => {
  const handleChatPopoverClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { messageId } = event.currentTarget.dataset;

      if (messageId) {
        event.stopPropagation();
        event.preventDefault();
        setPopoverMessageId(messageId);
      }
    },
    [setPopoverMessageId]
  );

  const handleChatPopoverClose = useCallback((): void => {
    setPopoverMessageId(null);
  }, [setPopoverMessageId]);

  return (
    <MessagePopover
      isOpened={message.id === popoverMessageId}
      key={message.id}
      messageId={message.id}
      onClose={handleChatPopoverClose}
      setEditingMessageId={setEditingMessageId}
    >
      <div
        className={`${styles['message-wrapper']} ${message.id === popoverMessageId ? styles['active'] : ''}`}
      >
        <Avatar
          name={message.sender.username}
          picture={message.sender.profilePicture}
        />
        <button
          className={styles['message-content']}
          data-message-id={message.id}
          onContextMenu={handleChatPopoverClick}
        >
          <div className={styles['message-header']}>
            <p className={styles['user-name']}>{message.sender.username}</p>
          </div>
          <p className={styles['message-text']}>{message.content}</p>
          <MessageFooter message={message} />
        </button>
      </div>
    </MessagePopover>
  );
};

export { MessageItem };
