import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useDebounce,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { userActions } from '~/modules/user/user.js';

import { SearchBar } from '../components.js';
import { UserItem } from './components/user-item/user-item.js';
import styles from './styles.module.scss';

const DEBOUNCE_DELAY = 500;

const CreateChat: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);
  const { users } = useAppSelector(state => state.user);
  const { profile } = useAppSelector(state => state.profile);

  useEffect(() => {
    void dispatch(userActions.getUsersByUsername(debouncedSearchQuery.trim()));
  }, [debouncedSearchQuery, dispatch]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setSearchQuery(event.target.value);
    },
    []
  );

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
          <div className={styles['user-item']} key={user.id}>
            <UserItem user={user} />
          </div>
        ))}
      </div>
    </div>
  );
};

export { CreateChat };
