import { Avatar, Loader } from '~/libs/components/components.js';
import { DataStatus } from '~/libs/enums/enums.js';
import { useAppSelector, useCallback, useState } from '~/libs/hooks/hooks.js';

import { MessagePopover } from './libs/components/message-popover/message-popover.js';
import styles from './styles.module.scss';

const MessageHistory = (): JSX.Element => {
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const [popoverMessageId, setPopoverMessageId] = useState<null | string>(null);

  const { dataStatus, messages } = useAppSelector(state => state.message);

  const handleChatPopoverClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { messageId } = event.currentTarget.dataset;

      if (messageId) {
        event.stopPropagation();
        event.preventDefault();
        setPopoverMessageId(messageId);
      }
    },
    []
  );

  const handleChatPopoverClose = useCallback((): void => {
    setPopoverMessageId(null);
  }, []);

  if (!chat) {
    return <></>;
  }

  if (dataStatus === DataStatus.PENDING) {
    return <Loader />;
  }

  return (
    <div className={`${styles['messages-list']}`}>
      {messages.map(message => (
        <MessagePopover
          isOpened={message.id === popoverMessageId}
          key={message.id}
          messageId={message.id}
          onClose={handleChatPopoverClose}
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
            </button>
          </div>
        </MessagePopover>
      ))}
    </div>
  );
};

export { MessageHistory };
