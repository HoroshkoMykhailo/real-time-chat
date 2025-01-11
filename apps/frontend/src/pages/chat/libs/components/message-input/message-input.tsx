import { ZERO_VALUE } from '~/libs/common/constants.js';
import { Avatar, Button, Icon } from '~/libs/components/components.js';
import { ButtonColor, DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';
import { messageActions } from '~/modules/messages/message.js';

import styles from './styles.module.scss';

type Properties = {
  editingMessageId: null | string;
  setEditingMessageId: (messageId: null | string) => void;
};

const MessageInput = ({
  editingMessageId,
  setEditingMessageId
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const { messages, writeDataStatus } = useAppSelector(state => state.message);
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);
  const [currentChatId, setCurrentChatId] = useState<null | string>(null);
  const [message, setMessage] = useState<string>('');
  const inputReference = useRef<HTMLInputElement>(null);
  const messageReference = useRef(message);

  const handleSend = useCallback(() => {
    if (message.trim() && chat) {
      if (editingMessageId) {
        void dispatch(
          messageActions.updateTextMessage({
            content: { content: message },
            messageId: editingMessageId
          })
        );
        setEditingMessageId(null);
      } else {
        void dispatch(
          messageActions.writeTextMessage({
            chatId: chat.id,
            content: { content: message }
          })
        );
      }

      dispatch(
        chatActions.deleteDraft({
          chatId: chat.id
        })
      );
      setMessage('');
    }
  }, [chat, dispatch, editingMessageId, message, setEditingMessageId]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setMessage(event.target.value);
    },
    []
  );

  useEffect(() => {
    messageReference.current = message;
  }, [message]);

  useEffect(() => {
    if (writeDataStatus === DataStatus.FULFILLED) {
      const message = messages.at(ZERO_VALUE);

      dispatch(messageActions.resetWriteDataStatus());

      if (message) {
        dispatch(
          chatActions.updateLastMessage({
            chatId: message.chatId,
            message: {
              content: message.content,
              createdAt: message.createdAt,
              senderName: message.sender.username
            }
          })
        );
      }
    }
  }, [dispatch, messages, writeDataStatus]);

  useEffect(() => {
    if (editingMessageId) {
      const message = messages.find(message => message.id === editingMessageId);

      if (message) {
        setMessage(message.content);
        inputReference.current?.focus();
      }
    }
  }, [editingMessageId, messages]);

  useEffect(() => {
    if (currentChatId) {
      const message = messageReference.current;
      const chatId = currentChatId;

      if (message.trim()) {
        dispatch(
          chatActions.saveDraft({
            chatId,
            draft: {
              content: messageReference.current,
              createdAt: new Date().toISOString()
            }
          })
        );
      } else {
        dispatch(
          chatActions.deleteDraft({
            chatId
          })
        );
      }
    }

    if (inputReference.current) {
      inputReference.current.focus();
    }

    if (chat?.draft) {
      setMessage(chat.draft.content);
    } else {
      setMessage('');
    }

    if (chat?.id) {
      setCurrentChatId(chat.id);
    }

    setEditingMessageId(null);
  }, [chat, currentChatId, dispatch, setEditingMessageId]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent): void => {
      const isLetter = /^[A-Za-zЁЄІЇА-яёєіїҐґ]$/.test(event.key);

      const activeElement = document.activeElement as HTMLElement;
      const isInputActive =
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable;

      if (isLetter && !isInputActive) {
        inputReference.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return (): void => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  if (!profile) {
    return <></>;
  }

  return (
    <div className={styles['message-input']}>
      <Avatar name={profile.username} picture={profile.profilePicture} />
      <div className={styles['input-container']}>
        <div className={styles['input-wrapper']}>
          <input
            className={styles['input']}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            ref={inputReference}
            type="text"
            value={message}
          />
          <div className={styles['button-container']}>
            <button className={styles['icon-button']} title="Attach Image">
              <Icon height={24} name="image" width={24} />
            </button>
            <Button
              className={styles['send-button'] ?? ''}
              color={ButtonColor.TEAL}
              isPrimary
              onClick={handleSend}
            >
              {editingMessageId ? 'Edit' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MessageInput };
