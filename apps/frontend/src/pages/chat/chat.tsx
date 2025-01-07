import { Navigate, useParams } from 'react-router-dom';

import { AppRoute } from '~/libs/enums/enums.js';
import { useAppSelector, useCallback, useState } from '~/libs/hooks/hooks.js';

import { ChatHeader } from './components/chat-header/chat-header.js';
import { ChatInfo } from './components/chat-info/chat-info.js';
import styles from './styles.module.scss';

const Chat: React.FC = () => {
  const { id: chatId } = useParams<{ id: string }>();
  const { selectedChat: chat } = useAppSelector(state => state.chat);

  const [isChatInfo, setChatInfo] = useState<boolean>(false);

  const handleHeaderClick = useCallback(() => {
    setChatInfo(!isChatInfo);
  }, [isChatInfo]);

  if (chatId !== chat?.id) {
    return <Navigate to={AppRoute.ROOT} />;
  }

  return (
    <div className={styles['chat-layout']}>
      <div className={styles['chat-content']}>
        <ChatHeader onHeaderClick={handleHeaderClick} />
        <div className={styles['chat-messages']}>
          <p>Messages goes here...</p>
        </div>
      </div>
      <ChatInfo
        isOpen={isChatInfo}
        onClose={handleHeaderClick}
        onOpenChatInfoChange={handleHeaderClick}
      />
    </div>
  );
};

export { Chat };
