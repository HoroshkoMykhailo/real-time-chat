import { Navigate, useParams } from 'react-router-dom';

import { AppRoute } from '~/libs/enums/enums.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';

import { ChatHeader } from './components/chat-header/chat-header.js';
import styles from './styles.module.scss';

const Chat: React.FC = () => {
  const { id: chatId } = useParams<{ id: string }>();
  const { selectedChat: chat } = useAppSelector(state => state.chat);

  if (chatId !== chat?.id) {
    return <Navigate to={AppRoute.ROOT} />;
  }

  return (
    <div className={styles['chat-layout']}>
      <ChatHeader />
    </div>
  );
};

export { Chat };
