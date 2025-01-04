import { useNavigate } from 'react-router-dom';

import {
  DEBOUNCE_DELAY,
  MINUS_ONE_VALUE,
  ONE_VALUE,
  ZERO_VALUE
} from '~/libs/common/constants.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useDebounce,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';
import { type Profile } from '~/modules/profile/profile.js';
import { userActions } from '~/modules/user/user.js';

import { SearchBar } from '../components.js';
import { UserItem } from './components/user-item/user-item.js';
import styles from './styles.module.scss';

const CreateGroup = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);
  const { createdChat } = useAppSelector(state => state.chat);
  const { users } = useAppSelector(state => state.user);
  const { profile } = useAppSelector(state => state.profile);
  const navigate = useNavigate();

  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);

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

      if (userId) {
        setSelectedUsers(previousSelected => {
          const userIndex = previousSelected.findIndex(
            user => user.id === userId
          );

          if (userIndex === MINUS_ONE_VALUE) {
            const userToAdd = users.find(user => user.id === userId);

            if (userToAdd) {
              return [...previousSelected, userToAdd];
            }
          } else {
            return [
              ...previousSelected.slice(ZERO_VALUE, userIndex),
              ...previousSelected.slice(userIndex + ONE_VALUE)
            ];
          }

          return previousSelected;
        });
      }
    },
    [users]
  );

  useEffect(() => {
    if (createdChat) {
      dispatch(chatActions.setSelectedChat(createdChat));
      navigate(`${AppRoute.CHATS}/${createdChat.id}`);
    }
  }, [navigate, dispatch, createdChat]);

  const filteredUsers = users.filter(user => user.id !== profile?.id);

  const selectedUserIds = new Set(selectedUsers.map(user => user.id));

  const nonSelectedUsers = filteredUsers.filter(
    user => !selectedUserIds.has(user.id)
  );

  const combinedUsers = [...selectedUsers, ...nonSelectedUsers];

  return (
    <div className={styles['create-chat-container']}>
      <h2 className={styles['create-group-title']}>Add Members</h2>
      <SearchBar
        onChange={handleSearchChange}
        placeholder="Search users"
        value={searchQuery}
      />
      <div className={styles['user-list']}>
        {combinedUsers.map(user => (
          <button
            className={styles['user-item']}
            data-user-id={user.id}
            key={user.id}
            onClick={handleUserClick}
          >
            <UserItem isSelected={selectedUserIds.has(user.id)} user={user} />
          </button>
        ))}
      </div>
    </div>
  );
};

export { CreateGroup };
