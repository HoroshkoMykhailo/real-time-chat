import { ChatPicture } from '~/libs/components/components.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

const ONE_MEMBER = 1;

const ChatHeader: React.FC = () => {
  const { selectedChat: chat } = useAppSelector(state => state.chat);

  if (!chat) {
    return null;
  }

  const { chatPicture, name } = chat;

  const memberLabel =
    chat.members?.length === ONE_MEMBER ? 'member' : 'members';

  return (
    <div className={styles['chat-header']}>
      <ChatPicture name={name} picture={chatPicture} />
      <div className={styles['chat-info']}>
        <h2 className={styles['chat-name']}>{name}</h2>
        <p className={styles['chat-users']}>
          {chat.members ? `${chat.members.length} ${memberLabel}` : ''}
        </p>
      </div>
    </div>
  );
};

export { ChatHeader };
