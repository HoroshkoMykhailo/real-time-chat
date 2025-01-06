import { useNavigate } from 'react-router-dom';

import {
  DEBOUNCE_DELAY,
  MINUS_ONE_VALUE,
  ONE_VALUE,
  ZERO_VALUE
} from '~/libs/common/constants.js';
import { AppRoute, ButtonColor } from '~/libs/enums/enums.js';
import { checkGreaterThanZero } from '~/libs/helpers/helpers.js';
import {
  useAppDispatch,
  useAppForm,
  useAppSelector,
  useCallback,
  useDebounce,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { type ValueOf } from '~/libs/types/types.js';
import {
  ChatPayloadKey,
  type ChatType,
  chatActions
} from '~/modules/chat/chat.js';
import { type ChatCreationRequestDto } from '~/modules/chat/libs/types/types.js';
import { chatCreationValidationSchema } from '~/modules/chat/libs/validation-schemas/validation-schemas.js';
import { type Profile } from '~/modules/profile/profile.js';
import { userActions } from '~/modules/user/user.js';
import { ActiveSideView } from '~/pages/main/libs/enums/active-side-view.enum.js';

import { Button, Icon, Image, Input, SearchBar } from '../components.js';
import { DEFAULT_CREATE_GROUP_PAYLOAD } from './libs/common/constants.js';
import { UserItem } from './libs/components/user-item/user-item.js';
import styles from './styles.module.scss';

type GroupFormValues = {
  groupPicture: File | null;
  members: string[];
  name: string;
  type: ValueOf<typeof ChatType>;
};

type Properties = {
  setActiveView: (value: ValueOf<typeof ActiveSideView>) => void;
};

const CreateGroup = ({ setActiveView }: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);
  const { createdChat } = useAppSelector(state => state.chat);
  const { users } = useAppSelector(state => state.user);
  const { profile } = useAppSelector(state => state.profile);
  const navigate = useNavigate();

  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [isGroupInformation, setIsGroupInformation] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<null | string>(null);

  const { control, errors, handleSubmit, setValue } =
    useAppForm<GroupFormValues>({
      defaultValues: DEFAULT_CREATE_GROUP_PAYLOAD,
      validationSchema: chatCreationValidationSchema
    });

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (
        event.target.files &&
        checkGreaterThanZero(event.target.files.length)
      ) {
        const [file] = event.target.files;

        if (file) {
          setImageUrl(URL.createObjectURL(file));
          setValue(ChatPayloadKey.GROUP_PICTURE, file);
        }
      }
    },
    [setValue]
  );

  const handleFormSubmit = useCallback(
    (values: GroupFormValues): void => {
      const group: ChatCreationRequestDto = {
        groupPicture: values.groupPicture,
        members: values.members,
        name: values.name,
        type: values.type
      };

      void dispatch(chatActions.createGroup(group));
      dispatch(chatActions.resetSelectedChat());
    },
    [dispatch]
  );

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
      setActiveView(ActiveSideView.ChatList);
    }
  }, [navigate, dispatch, createdChat, setActiveView]);

  const filteredUsers = users.filter(user => user.id !== profile?.id);

  const selectedUserIds = new Set(selectedUsers.map(user => user.id));

  const nonSelectedUsers = filteredUsers.filter(
    user => !selectedUserIds.has(user.id)
  );

  const combinedUsers = [...selectedUsers, ...nonSelectedUsers];

  const handleContinueClick = useCallback(() => {
    if (isGroupInformation) {
      void handleSubmit(handleFormSubmit)();
    } else {
      setIsGroupInformation(true);

      if (profile) {
        setValue(ChatPayloadKey.MEMBERS, [
          profile.id,
          ...selectedUsers.map(user => user.id)
        ]);
      }
    }
  }, [
    handleFormSubmit,
    handleSubmit,
    isGroupInformation,
    profile,
    selectedUsers,
    setValue
  ]);

  return (
    <div className={styles['create-chat-container']}>
      <div className={styles['create-group-header']}>
        <h2 className={styles['create-group-title']}>
          {isGroupInformation ? 'Group Information' : 'Add Members'}
        </h2>
        <Button
          className={styles['continue-button'] ?? ''}
          color={ButtonColor.TEAL}
          isPrimary
          onClick={handleContinueClick}
        >
          Continue
        </Button>
      </div>
      {isGroupInformation ? (
        <>
          <form name="groupForm">
            <fieldset className={styles['fieldset']}>
              <div className={styles['imageGroup']}>
                <label
                  className={styles['groupPicture']}
                  htmlFor={ChatPayloadKey.GROUP_PICTURE}
                >
                  {imageUrl ? (
                    <>
                      <Image
                        alt="Selected"
                        height="144"
                        isCircular
                        src={imageUrl}
                        width="144"
                      />
                      <div
                        className={`${styles['cameraIcon']} ${styles['hasImage']}`}
                      >
                        <Icon height={48} name="camera" width={48} />
                      </div>
                    </>
                  ) : (
                    <div
                      className={`${styles['cameraIcon']} ${styles['noImage']}`}
                    >
                      <Icon height={48} name="camera" width={48} />
                    </div>
                  )}
                  <input
                    accept="image/*"
                    id={ChatPayloadKey.GROUP_PICTURE}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    type="file"
                  />
                </label>
              </div>
              <div className={styles['GroupName']}>
                <label className={styles['label']} htmlFor="name">
                  Group Name
                </label>
                <Input
                  control={control}
                  errors={errors}
                  name="name"
                  placeholder="Enter group name"
                  type="text"
                />
              </div>
            </fieldset>
          </form>
          {selectedUsers.length > ZERO_VALUE && (
            <p className={styles['selected-users-count']}>
              {selectedUsers.length} Member
              {selectedUsers.length === ONE_VALUE ? '' : 's'}
            </p>
          )}
          <div className={styles['user-list']}>
            {selectedUsers.map(user => (
              <div className={styles['user-item']} key={user.id}>
                <UserItem user={user} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <SearchBar
            onChange={handleSearchChange}
            placeholder="Search users"
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
      )}
    </div>
  );
};

export { CreateGroup };
