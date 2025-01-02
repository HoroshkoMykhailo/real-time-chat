import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoute, DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { ChatType, chatActions } from '~/modules/chat/chat.js';
import { type ChatsResponseDto } from '~/modules/chat/libs/types/types.js';

import { ChatPicture, Icon, Loader } from '../components.js';
import { ChatPopover } from './libs/components/chat-popover/chat-popover.js';
import { formatLastMessageTime } from './libs/helpers/format-last-message-time.js';
import styles from './styles.module.scss';

const ChatList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { chats, dataStatus } = useAppSelector(state => state.chat);
  const { selectedChat } = useAppSelector(state => state.chat);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [popoverChatId, setPopoverChatId] = useState<null | string>(null);
  const navigate = useNavigate();

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

  const handleChatClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const chatData = event.currentTarget.dataset['chat'];

      if (chatData) {
        const chat = JSON.parse(chatData) as ChatsResponseDto[number];
        dispatch(chatActions.setSelectedChat(chat));
        void dispatch(chatActions.getChat({ id: chat.id }));
        navigate(`${AppRoute.CHATS}/${chat.id}`);
      }
    },
    [dispatch, navigate]
  );

  const handleChatPopoverClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const chatData = event.currentTarget.dataset['chat'];

      if (chatData) {
        const chat = JSON.parse(chatData) as ChatsResponseDto[number];
        event.stopPropagation();
        event.preventDefault();
        setPopoverChatId(chat.id);
      }
    },
    []
  );

  const handleChatPopoverClose = useCallback((): void => {
    setPopoverChatId(null);
  }, []);

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
          <ChatPopover
            chatId={chat.id}
            isOpened={popoverChatId === chat.id}
            key={chat.id}
            onClose={handleChatPopoverClose}
            {...(selectedChat && { currentChatId: selectedChat.id })}
          >
            <button
              className={`${styles['chat-item']} ${
                selectedChat?.id === chat.id || chat.id === popoverChatId
                  ? styles['selected']
                  : ''
              }`}
              data-chat={JSON.stringify(chat)}
              key={chat.id}
              onClick={handleChatClick}
              onContextMenu={handleChatPopoverClick}
            >
              <div className={styles['chat-item-content']}>
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
            </button>
          </ChatPopover>
        ))}
      </div>
    </div>
  );
};

export { ChatList };
