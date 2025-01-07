import { ONE_VALUE } from '~/libs/common/constants.js';
import { ChatPicture } from '~/libs/components/components.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';
import { ChatType } from '~/modules/chat/chat.js';

import styles from './styles.module.scss';

type Properties = {
  onHeaderClick: () => void;
};

const ChatHeader = ({ onHeaderClick }: Properties): JSX.Element => {
  const { selectedChat: chat } = useAppSelector(state => state.chat);

  if (!chat) {
    return <></>;
  }

  const { chatPicture, name } = chat;

  const memberLabel = chat.members?.length === ONE_VALUE ? 'member' : 'members';

  return (
    <button className={styles['chat-header']} onClick={onHeaderClick}>
      <ChatPicture name={name} picture={chatPicture} />
      <div
        className={
          chat.type === ChatType.PRIVATE
            ? `${styles['chat-info']} ${styles['private']}`
            : styles['chat-info']
        }
      >
        <h2 className={styles['chat-name']}>{name}</h2>
        <p className={styles['chat-users']}>
          {chat.members && chat.type === ChatType.GROUP
            ? `${chat.members.length} ${memberLabel}`
            : ''}
        </p>
      </div>
    </button>
  );
};

export { ChatHeader };
