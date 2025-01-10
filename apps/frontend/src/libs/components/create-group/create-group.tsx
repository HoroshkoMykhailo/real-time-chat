import {
  MINUS_ONE_VALUE,
  ONE_VALUE,
  ZERO_VALUE
} from '~/libs/common/constants.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppForm,
  useAppSelector,
  useCallback,
  useEffect,
  useNavigate,
  useState
} from '~/libs/hooks/hooks.js';
import { type ValueOf } from '~/libs/types/types.js';
import {
  ChatPayloadKey,
  ChatType,
  chatActions,
  chatCreationValidationSchema
} from '~/modules/chat/chat.js';
import { type ChatCreationRequestDto } from '~/modules/chat/libs/types/types.js';
import { messageActions } from '~/modules/messages/message.js';
import { type Profile } from '~/modules/profile/profile.js';
import { ActiveSideView } from '~/pages/main/libs/enums/active-side-view.enum.js';

import { DEFAULT_CREATE_GROUP_PAYLOAD } from './libs/common/constants.js';
import { GroupForm } from './libs/components/group-form/group-form.js';
import { CreateGroupHeader } from './libs/components/header/header.js';
import { MemberList } from './libs/components/member-list/member-list.js';
import { UserSearch } from './libs/components/user-search/user-search.js';
import { type GroupFormValues } from './libs/types/group-form-values.type.js';

type Properties = {
  setActiveView: (value: ValueOf<typeof ActiveSideView>) => void;
};

const CreateGroup = ({ setActiveView }: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const { createdChat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);
  const navigate = useNavigate();

  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [isGroupInformation, setIsGroupInformation] = useState<boolean>(false);

  const { control, errors, handleSubmit, setValue } =
    useAppForm<GroupFormValues>({
      defaultValues: DEFAULT_CREATE_GROUP_PAYLOAD,
      validationSchema: chatCreationValidationSchema
    });

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

  useEffect(() => {
    if (createdChat) {
      dispatch(chatActions.setSelectedChat(createdChat));
      void dispatch(messageActions.getMessages({ chatId: createdChat.id }));

      if (createdChat.type === ChatType.GROUP) {
        void dispatch(chatActions.getChat({ id: createdChat.id }));
      }

      navigate(`${AppRoute.CHATS}/${createdChat.id}`);
      setActiveView(ActiveSideView.ChatList);
      dispatch(chatActions.resetCreatedChat());
    }
  }, [navigate, dispatch, createdChat, setActiveView]);

  return (
    <>
      <CreateGroupHeader
        isGroupInformation={isGroupInformation}
        onContinueClick={handleContinueClick}
      />
      {isGroupInformation ? (
        <>
          <GroupForm control={control} errors={errors} setValue={setValue} />
          <MemberList selectedUsers={selectedUsers} />
        </>
      ) : (
        <UserSearch
          onUserSelect={handleUserSelect}
          selectedUsers={selectedUsers}
        />
      )}
    </>
  );
};

export { CreateGroup };
export { GroupForm } from './libs/components/group-form/group-form.js';
export { CreateGroupHeader } from './libs/components/header/header.js';
export { UserSearch } from './libs/components/user-search/user-search.js';
