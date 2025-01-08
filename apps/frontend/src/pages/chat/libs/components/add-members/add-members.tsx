import {
  MINUS_ONE_VALUE,
  ONE_VALUE,
  ZERO_VALUE
} from '~/libs/common/constants.js';
import {
  Button,
  CreateGroupHeader,
  UserSearch
} from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useState
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';
import { type Profile } from '~/modules/profile/profile.js';

import styles from './styles.module.scss';

type Properties = {
  onCancel: () => void;
};

const AddMembers = ({ onCancel }: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const { selectedChat: chat } = useAppSelector(state => state.chat);

  const handleUserSelect = useCallback((user: Profile): void => {
    setSelectedUsers(previous => {
      const userIndex = previous.findIndex(u => u.id === user.id);

      if (userIndex === MINUS_ONE_VALUE) {
        return [...previous, user];
      }

      return [
        ...previous.slice(ZERO_VALUE, userIndex),
        ...previous.slice(userIndex + ONE_VALUE)
      ];
    });
  }, []);

  const handleContinueClick = useCallback((): void => {
    if (chat) {
      void dispatch(
        chatActions.addMembers({
          id: chat.id,
          members: selectedUsers.map(member => member.id)
        })
      );
      onCancel();
    }
  }, [chat, dispatch, onCancel, selectedUsers]);

  if (!chat) {
    return <></>;
  }

  return (
    <div className={styles['add-members-container']}>
      <CreateGroupHeader
        isContinueButtonEnabled={selectedUsers.length > ZERO_VALUE}
        onContinueClick={handleContinueClick}
      />
      <UserSearch
        excludedUsers={chat.members ?? []}
        onUserSelect={handleUserSelect}
        selectedUsers={selectedUsers}
      />
      <div className={styles['cancel-button-wrapper'] ?? ''}>
        <Button
          className={styles['cancel-button'] ?? ''}
          color={ButtonColor.TEAL}
          isPrimary
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export { AddMembers };
