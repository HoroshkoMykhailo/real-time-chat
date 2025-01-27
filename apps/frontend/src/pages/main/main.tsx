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
  useAppSelector,
  useCallback,
  useEffect,
  usePopover,
  useState
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type ValueOf } from '~/libs/types/types.js';
import { chatActions } from '~/modules/chat/chat.js';
import { messageActions } from '~/modules/messages/message.js';
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

  const { profile } = useAppSelector(state => state.profile);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    void dispatch(profileActions.getProfile());
    void dispatch(chatActions.getMyChats());
    dispatch(chatActions.resetSelectedChat());
  }, [dispatch]);

  const handleMouseEnter = useCallback((): void => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setIsHovered(false);
    onCreateChatClose();
  }, [onCreateChatClose]);

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
    dispatch(messageActions.resetMessages());
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

  if (!profile) {
    return <></>;
  }

  return (
    <div className={styles['page']}>
      <div className={styles['page-header']}>
        <Header onLogoClick={handleLogoClick} />
      </div>
      <div className={styles['page-content']}>
        <nav
          className={styles['side-bar']}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {renderContent()}
          <div
            className={styles['create-chat-wrapper']}
            style={{ display: isHovered ? 'block' : 'none' }}
          >
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
                  ? translate.translate('createChat', profile.language)
                  : translate.translate('cancel', profile.language)}
              </Button>
            </CreateChatPopover>
          </div>
        </nav>
        <RouterOutlet />
      </div>
    </div>
  );
};

export { Main };
