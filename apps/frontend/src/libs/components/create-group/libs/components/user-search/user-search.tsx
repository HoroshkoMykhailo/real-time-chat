import { useCallback, useEffect, useState } from 'react';

import { DEBOUNCE_DELAY } from '~/libs/common/constants.js';
import { SearchBar } from '~/libs/components/components.js';
import {
  useAppDispatch,
  useAppSelector,
  useDebounce
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type Profile } from '~/modules/profile/profile.js';
import { userActions } from '~/modules/user/user.js';

import styles from '../../../styles.module.scss';
import { UserItem } from '../user-item/user-item.js';

type Properties = {
  excludedUsers?: Profile[];
  onUserSelect: (user: Profile) => void;
  selectedUsers: Profile[];
};

const UserSearch = ({
  excludedUsers = [],
  onUserSelect,
  selectedUsers
}: Properties): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dispatch = useAppDispatch();
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);
  const { users } = useAppSelector(state => state.user);
  const { profile } = useAppSelector(state => state.profile);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setSearchQuery(event.target.value);
    },
    []
  );

  useEffect(() => {
    void dispatch(userActions.getUsersByUsername(debouncedSearchQuery.trim()));
  }, [debouncedSearchQuery, dispatch]);

  const handleUserClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      const { userId } = event.currentTarget.dataset;

      if (userId) {
        const user = users.find(u => u.id === userId);

        if (user) {
          onUserSelect(user);
        }
      }
    },
    [users, onUserSelect]
  );

  if (!profile) {
    return <></>;
  }

  const selectedUserIds = new Set(selectedUsers.map(user => user.id));
  const excludedUserIds = new Set(excludedUsers.map(user => user.id));

  const filteredUsers = users.filter(
    user => user.id !== profile.id && !excludedUserIds.has(user.id)
  );
  const nonSelectedUsers = filteredUsers.filter(
    user => !selectedUserIds.has(user.id)
  );
  const combinedUsers = [...selectedUsers, ...nonSelectedUsers];

  return (
    <>
      <SearchBar
        onChange={handleSearchChange}
        placeholder={translate.translate('searchUsers', profile.language)}
        value={searchQuery}
      />
      <div className={styles['user-list']}>
        {combinedUsers.map(user => (
          <button
            className={`${styles['user-item']} ${styles['selectable']}`}
            data-user-id={user.id}
            key={user.id}
            onClick={handleUserClick}
          >
            <UserItem
              isSelectable
              isSelected={selectedUserIds.has(user.id)}
              user={user}
            />
          </button>
        ))}
      </div>
    </>
  );
};

export { UserSearch };
