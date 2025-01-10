import { Avatar } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useNavigate
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';
import { type GetMessagesResponseDto } from '~/modules/messages/libs/types/types.js';
import { messageActions } from '~/modules/messages/message.js';

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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile } = useAppSelector(state => state.profile);
  const { createdChat } = useAppSelector(state => state.chat);

  const handleChatPopoverClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id: messageId } = message;

      if (messageId) {
        event.stopPropagation();
        event.preventDefault();
        setPopoverMessageId(messageId);
      }
    },
    [message, setPopoverMessageId]
  );

  const handleUserClick = useCallback((): void => {
    const memberId = message.sender.id;

    if (memberId && profile && memberId !== profile.id) {
      void dispatch(
        chatActions.createPrivateChat({
          otherId: memberId,
          userId: profile.id
        })
      );
    }
  }, [message, profile, dispatch]);

  const handleMessageClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains(styles['user-name'] ?? '')) {
        handleUserClick();
      }
    },
    [handleUserClick]
  );

  useEffect(() => {
    if (createdChat) {
      void dispatch(messageActions.getMessages({ chatId: createdChat.id }));
      void dispatch(chatActions.getChat({ id: createdChat.id }));

      navigate(`${AppRoute.CHATS}/${createdChat.id}`);
      dispatch(chatActions.setSelectedChat(createdChat));
    }
  }, [navigate, dispatch, createdChat]);

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
        <button className={styles['message-avatar']} onClick={handleUserClick}>
          <Avatar
            name={message.sender.username}
            picture={message.sender.profilePicture}
          />
        </button>
        <button
          className={styles['message-content']}
          onClick={handleMessageClick}
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
