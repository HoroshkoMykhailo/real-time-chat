import { AppRoute, DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useNavigate,
  useParams,
  useState
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';
import { type ChatsResponseDto } from '~/modules/chat/libs/types/types.js';
import { messageActions } from '~/modules/messages/message.js';

import { Loader, SearchBar } from '../components.js';
import { ChatItem } from './libs/components/chat-item/chat-item.js';
import { ChatPopover } from './libs/components/chat-popover/chat-popover.js';
import styles from './styles.module.scss';

const ChatList = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { id: chatId } = useParams<{ id: string }>();
  const { chats, dataStatus, selectedChat } = useAppSelector(
    state => state.chat
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [popoverChatId, setPopoverChatId] = useState<null | string>(null);
  const navigate = useNavigate();

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

        if (chat.id !== selectedChat?.id) {
          dispatch(chatActions.setSelectedChat(chat));

          void dispatch(messageActions.getMessages({ chatId: chat.id }));

          void dispatch(chatActions.getChat({ id: chat.id }));

          navigate(`${AppRoute.CHATS}/${chat.id}`);
        }
      }
    },
    [dispatch, navigate, selectedChat?.id]
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
    <>
      <SearchBar
        onChange={handleSearchChange}
        placeholder="Search chats"
        value={searchQuery}
      />
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
                (selectedChat?.id === chat.id && chatId === chat.id) ||
                chat.id === popoverChatId
                  ? styles['selected']
                  : ''
              }`}
              data-chat={JSON.stringify(chat)}
              key={chat.id}
              onClick={handleChatClick}
              onContextMenu={handleChatPopoverClick}
            >
              <ChatItem chat={chat} />
            </button>
          </ChatPopover>
        ))}
      </div>
    </>
  );
};

export { ChatList };
