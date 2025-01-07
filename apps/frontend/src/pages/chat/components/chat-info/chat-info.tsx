import { ChatPicture } from '~/libs/components/components.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';
import { ChatType } from '~/modules/chat/chat.js';

import { ChatInfoHeader } from './components/chat-info-header/chat-info-header.js';
import { MembersList } from './components/members-list/member-list.js';
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
        <ChatPicture
          height="250"
          name={chat.name}
          picture={chat.chatPicture}
          width="349"
        />
        <div className={styles['chat-name-wrapper']}>
          <h2 className={styles['chat-name']}>{chat.name}</h2>
          {chat.type === ChatType.GROUP && chat.members && (
            <span className={styles['member-count']}>
              {chat.members.length} members
            </span>
          )}
        </div>
      </div>
      {chat.type === ChatType.GROUP && chat.members && <MembersList />}
    </div>
  );
};

export { ChatInfo };
