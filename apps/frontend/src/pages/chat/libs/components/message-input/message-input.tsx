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

const MessageInput = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { messages, writeDataStatus } = useAppSelector(state => state.message);
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);
  const [message, setMessage] = useState<string>('');
  const inputReference = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (message.trim() && chat) {
      void dispatch(
        messageActions.writeTextMessage({
          chatId: chat.id,
          content: { content: message }
        })
      );
      setMessage('');
    }
  }, [chat, dispatch, message]);

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
    if (inputReference.current) {
      inputReference.current.focus();
    }
  }, [chat?.id]);

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
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MessageInput };
