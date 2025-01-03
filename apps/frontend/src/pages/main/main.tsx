import {
  Button,
  ChatList,
  Header,
  RouterOutlet
} from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import { useAppDispatch, useEffect, usePopover } from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';
import { profileActions } from '~/modules/profile/profile.js';

import { CreateChatPopover } from './components/create-chat-popover/create-chat-popover.js';
import styles from './styles.module.scss';

const Main: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isOpened: isCreateChatOpened,
    onClose: onCreateChatClose,
    onOpen: onCreateChatOpen
  } = usePopover();

  useEffect(() => {
    void dispatch(profileActions.getProfile());
    void dispatch(chatActions.getMyChats());
    dispatch(chatActions.resetSelectedChat());
  }, [dispatch]);

  return (
    <div className={styles['page']}>
      <div className={styles['page-header']}>
        <Header />
      </div>
      <div className={styles['page-content']}>
        <ChatList />
        <RouterOutlet />
      </div>
      <div className={styles['create-chat-button'] ?? ''}>
        <CreateChatPopover
          isOpened={isCreateChatOpened}
          onClose={onCreateChatClose}
        >
          <Button
            color={ButtonColor.TEAL}
            isPrimary
            onClick={isCreateChatOpened ? onCreateChatClose : onCreateChatOpen}
          >
            {isCreateChatOpened ? 'Cancel' : 'Create Chat'}
          </Button>
        </CreateChatPopover>
      </div>
    </div>
  );
};

export { Main };
