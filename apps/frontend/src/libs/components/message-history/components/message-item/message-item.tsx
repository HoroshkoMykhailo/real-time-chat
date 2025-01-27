import { Avatar } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useNavigate
} from '~/libs/hooks/hooks.js';
import { type ValueOf } from '~/libs/types/types.js';
import { chatActions } from '~/modules/chat/chat.js';
import { type MessageCreationResponseDto } from '~/modules/messages/libs/types/types.js';
import { MessageType, messageActions } from '~/modules/messages/message.js';

import {
  AudioMessage,
  FileMessage,
  ImageMessage,
  MessageFooter,
  MessagePopover,
  TextMessage,
  VideoMessage
} from './components/components.js';
import styles from './styles.module.scss';

type Properties = {
  message: MessageCreationResponseDto;
  popoverMessageId: null | string;
  setEditingMessageId?: (messageId: null | string) => void;
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
      const target = event.target as HTMLElement;

      if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
        return;
      }

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

  const handleChatPopoverClose = useCallback((): void => {
    setPopoverMessageId(null);
  }, [setPopoverMessageId]);

  const handleMessageClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const target = event.target as HTMLElement;

      handleChatPopoverClose();

      if (target.classList.contains(styles['user-name'] ?? '')) {
        handleUserClick();
      }
    },
    [handleChatPopoverClose, handleUserClick]
  );

  useEffect(() => {
    if (createdChat) {
      void dispatch(messageActions.getMessages({ chatId: createdChat.id }));
      void dispatch(chatActions.getChat({ id: createdChat.id }));

      navigate(`${AppRoute.CHATS}/${createdChat.id}`);
      dispatch(chatActions.setSelectedChat(createdChat));
    }
  }, [navigate, dispatch, createdChat]);

  const messageRenderers = new Map<
    ValueOf<typeof MessageType>,
    () => JSX.Element
  >([
    [
      MessageType.AUDIO,
      (): JSX.Element => <AudioMessage audioMessage={message} />
    ],
    [
      MessageType.FILE,
      (): JSX.Element => <FileMessage fileMessage={message} />
    ],
    [
      MessageType.IMAGE,
      (): JSX.Element => <ImageMessage imageMessage={message} />
    ],
    [
      MessageType.TEXT,
      (): JSX.Element => <TextMessage textMessage={message} />
    ],
    [
      MessageType.VIDEO,
      (): JSX.Element => <VideoMessage videoMessage={message} />
    ]
  ]);

  const renderMessageContent = (): JSX.Element => {
    const renderFunction = messageRenderers.get(message.type);

    if (renderFunction) {
      return renderFunction();
    }

    return <p>Unsupported message type</p>;
  };

  if (!profile) {
    return <></>;
  }

  return (
    <MessagePopover
      isOpened={message.id === popoverMessageId}
      key={message.id}
      messageId={message.id}
      onClose={handleChatPopoverClose}
      {...(setEditingMessageId && { setEditingMessageId })}
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
          {renderMessageContent()}
          <MessageFooter language={profile.language} message={message} />
        </button>
      </div>
    </MessagePopover>
  );
};

export { MessageItem };
