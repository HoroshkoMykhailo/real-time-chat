import { Avatar } from '~/libs/components/components.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

const MessageHistory = (): JSX.Element => {
  const { selectedChat: chat } = useAppSelector(state => state.chat);

  const { messages } = useAppSelector(state => state.message);

  if (!chat) {
    return <></>;
  }

  return (
    <div className={`${styles['messages-list']}`}>
      {messages.map(message => (
        <div className={styles['message-wrapper']} key={message.id}>
          <Avatar
            name={message.sender.username}
            picture={message.sender.profilePicture}
          />
          <div className={styles['message-content']}>
            <div className={styles['message-header']}>
              <p className={styles['user-name']}>{message.sender.username}</p>
            </div>
            <p className={styles['message-text']}>{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export { MessageHistory };
