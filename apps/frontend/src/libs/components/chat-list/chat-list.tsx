import React from 'react';

import { DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { ChatType, chatActions } from '~/modules/chat/chat.js';

import { Icon, Loader } from '../components.js';
import { ChatPicture } from './libs/chat-picture/chat-picture.js';
import { formatLastMessageTime } from './libs/helpers/format-last-message-time.js';
import styles from './styles.module.scss';

const ChatList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { chats, dataStatus } = useAppSelector(state => state.chat);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    void dispatch(chatActions.getMyChats());
  }, [dispatch]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setSearchQuery(event.target.value);
    },
    []
  );

  if (dataStatus === DataStatus.PENDING) {
    return <Loader />;
  }

  return (
    <div className={styles['chat-list-container']}>
      <div className={styles['search-bar']}>
        <div className={styles['search-icon']}>
          <Icon height={24} name="search" width={24} />
        </div>
        <input
          className={styles['search-input']}
          onChange={handleSearchChange}
          placeholder="Search chats"
          type="text"
          value={searchQuery}
        />
      </div>
      <div className={styles['chat-list']}>
        {filteredChats.map(chat => (
          <div className={styles['chat-item']} key={chat.id}>
            <ChatPicture name={chat.name} picture={chat.chatPicture} />
            <div className={styles['chat-info']}>
              <p className={styles['chat-name']}>{chat.name}</p>
              <p className={styles['chat-message']}>
                {chat.type === ChatType.GROUP &&
                chat.lastMessage?.senderName ? (
                  <>
                    <span className={styles['sender-name']}>
                      {chat.lastMessage.senderName}:
                    </span>
                    <span className={styles['message-content']}>
                      {chat.lastMessage.content}
                    </span>
                  </>
                ) : (
                  <span className={styles['message-content']}>
                    {chat.lastMessage?.content}
                  </span>
                )}
              </p>
            </div>
            <div className={styles['chat-time']}>
              {chat.lastMessage?.createdAt
                ? formatLastMessageTime(chat.lastMessage.createdAt)
                : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ChatList };
