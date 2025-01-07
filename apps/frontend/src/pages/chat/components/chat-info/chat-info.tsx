import { useAppSelector } from '~/libs/hooks/hooks.js';
import { ChatType } from '~/modules/chat/chat.js';

import { ChatInfoHeader } from './components/chat-info-header/chat-info-header.js';
import styles from './styles.module.scss';

type Properties = {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatInfoChange: () => void;
};

const ChatInfo = ({
  isOpen,
  onClose,
  onOpenChatInfoChange
}: Properties): JSX.Element => {
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);

  if (!chat || !profile) {
    return <></>;
  }

  const isAdmin = chat.adminId === profile.id;

  const chatTypeLabel =
    chat.type === ChatType.GROUP ? 'Group Info' : 'User Info';

  return (
    <div className={`${styles['chat-info']} ${isOpen ? styles['open'] : ''}`}>
      <ChatInfoHeader
        chatTypeLabel={chatTypeLabel}
        isAdmin={isAdmin}
        onClose={onClose}
        onOpenChatInfoChange={onOpenChatInfoChange}
      />
      <div className={styles['chat-info-content']}>
        <p>Chat info goes here...</p>
      </div>
    </div>
  );
};

export { ChatInfo };
