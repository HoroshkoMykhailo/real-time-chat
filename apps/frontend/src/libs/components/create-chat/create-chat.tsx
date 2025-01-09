import { DEBOUNCE_DELAY } from '~/libs/common/constants.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useDebounce,
  useEffect,
  useNavigate,
  useState
} from '~/libs/hooks/hooks.js';
import { ChatType, chatActions } from '~/modules/chat/chat.js';
import { messageActions } from '~/modules/messages/message.js';
import { userActions } from '~/modules/user/user.js';

import { SearchBar } from '../components.js';
import { UserItem } from './components/user-item/user-item.js';
import styles from './styles.module.scss';

const CreateChat = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);
  const { createdChat } = useAppSelector(state => state.chat);
  const { users } = useAppSelector(state => state.user);
  const { profile } = useAppSelector(state => state.profile);
  const navigate = useNavigate();

  useEffect(() => {
    void dispatch(userActions.getUsersByUsername(debouncedSearchQuery.trim()));
  }, [debouncedSearchQuery, dispatch]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setSearchQuery(event.target.value);
    },
    []
  );

  const handleUserClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      const { userId } = event.currentTarget.dataset;

      if (userId && profile) {
        void dispatch(
          chatActions.createPrivateChat({ otherId: userId, userId: profile.id })
        );
        dispatch(chatActions.resetSelectedChat());
      }
    },
    [profile, dispatch]
  );

  useEffect(() => {
    if (createdChat) {
      dispatch(chatActions.setSelectedChat(createdChat));
      void dispatch(messageActions.getMessages({ chatId: createdChat.id }));

      if (createdChat.type === ChatType.GROUP) {
        void dispatch(chatActions.getChat({ id: createdChat.id }));
      }

      navigate(`${AppRoute.CHATS}/${createdChat.id}`);
    }
  }, [navigate, dispatch, createdChat]);

  const filteredUsers = users.filter(user => user.id !== profile?.id);

  return (
    <div className={styles['create-chat-container']}>
      <SearchBar
        onChange={handleSearchChange}
        placeholder="Search users"
        value={searchQuery}
      />
      <div className={styles['user-list']}>
        {filteredUsers.map(user => (
          <button
            className={styles['user-item']}
            data-user-id={user.id}
            key={user.id}
            onClick={handleUserClick}
          >
            <UserItem user={user} />
          </button>
        ))}
      </div>
    </div>
  );
};

export { CreateChat };
