import {
  Button,
  ChatList,
  CreateChat,
  CreateGroup,
  Header,
  RouterOutlet
} from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useCallback,
  useEffect,
  usePopover,
  useState
} from '~/libs/hooks/hooks.js';
import { type ValueOf } from '~/libs/types/types.js';
import { chatActions } from '~/modules/chat/chat.js';
import { profileActions } from '~/modules/profile/profile.js';

import { CreateChatPopover } from './libs/components/create-chat-popover/create-chat-popover.js';
import { ActiveSideView } from './libs/enums/active-side-view.enum.js';
import styles from './styles.module.scss';

const Main: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isOpened: isCreateChatOpened,
    onClose: onCreateChatClose,
    onOpen: onCreateChatOpen
  } = usePopover();

  const [activeView, setActiveView] = useState<ValueOf<typeof ActiveSideView>>(
    ActiveSideView.ChatList
  );

  useEffect(() => {
    void dispatch(profileActions.getProfile());
    void dispatch(chatActions.getMyChats());
    dispatch(chatActions.resetSelectedChat());
  }, [dispatch]);

  const handleOpenCreateGroup = useCallback((): void => {
    setActiveView(ActiveSideView.CreateGroup);
    onCreateChatClose();
  }, [onCreateChatClose]);

  const handleOpenCreateChat = useCallback((): void => {
    setActiveView(ActiveSideView.CreateChat);
    onCreateChatClose();
  }, [onCreateChatClose]);

  const handleCancelClick = useCallback((): void => {
    if (activeView === ActiveSideView.ChatList) {
      isCreateChatOpened ? onCreateChatClose() : onCreateChatOpen();
    } else {
      setActiveView(ActiveSideView.ChatList);
      onCreateChatClose();
    }
  }, [activeView, isCreateChatOpened, onCreateChatClose, onCreateChatOpen]);

  const handleLogoClick = useCallback((): void => {
    setActiveView(ActiveSideView.ChatList);
    dispatch(chatActions.resetSelectedChat());
    onCreateChatClose();
  }, [dispatch, onCreateChatClose]);

  const viewMap = new Map<ValueOf<typeof ActiveSideView>, () => JSX.Element>([
    [ActiveSideView.ChatList, (): JSX.Element => <ChatList />],
    [ActiveSideView.CreateChat, (): JSX.Element => <CreateChat />],
    [
      ActiveSideView.CreateGroup,
      (): JSX.Element => <CreateGroup setActiveView={setActiveView} />
    ]
  ]);

  const renderContent = (): JSX.Element => {
    const renderFunction = viewMap.get(activeView);

    if (renderFunction) {
      return renderFunction();
    }

    return <></>;
  };

  return (
    <div className={styles['page']}>
      <div className={styles['page-header']}>
        <Header onLogoClick={handleLogoClick} />
      </div>
      <div className={styles['page-content']}>
        {renderContent()}
        <RouterOutlet />
      </div>
      <div className={styles['create-chat-wrapper']}>
        <CreateChatPopover
          isOpened={isCreateChatOpened}
          onClose={onCreateChatClose}
          onCreateChat={handleOpenCreateChat}
          onCreateGroup={handleOpenCreateGroup}
        >
          <Button
            className={styles['create-chat-button'] ?? ''}
            color={ButtonColor.TEAL}
            isPrimary
            onClick={handleCancelClick}
          >
            {!isCreateChatOpened && activeView === ActiveSideView.ChatList
              ? 'Create Chat'
              : 'Cancel'}
          </Button>
        </CreateChatPopover>
      </div>
    </div>
  );
};

export { Main };
