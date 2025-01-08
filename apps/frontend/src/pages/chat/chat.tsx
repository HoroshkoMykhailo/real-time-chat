import { Navigate, useParams } from 'react-router-dom';

import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppSelector,
  useCallback,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { type ValueOf } from '~/libs/types/types.js';

import { AddMembers } from './libs/components/add-members/add-members.js';
import { ChatHeader } from './libs/components/chat-header/chat-header.js';
import { ChatInfo } from './libs/components/chat-info/chat-info.js';
import { GroupEdit } from './libs/components/group-edit/group-edit.js';
import { ActiveChatView } from './libs/enums/active-chat-view.js';
import styles from './styles.module.scss';

const Chat: React.FC = () => {
  const { id: chatId } = useParams<{ id: string }>();
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const [activeChatView, setActiveChatView] = useState<
    ValueOf<typeof ActiveChatView>
  >(ActiveChatView.ChatInfo);
  const [isChatInfo, setChatInfo] = useState<boolean>(false);

  const viewMap = new Map<ValueOf<typeof ActiveChatView>, () => JSX.Element>([
    [
      ActiveChatView.AddMembers,
      (): JSX.Element => <AddMembers onCancel={handleToChatInfo} />
    ],
    [
      ActiveChatView.ChatInfo,
      (): JSX.Element => (
        <ChatInfo
          isOpen={isChatInfo}
          onClose={handleHeaderClick}
          onOpenAddMembers={handleOpenAddMembers}
          onOpenGroupEdit={handleToGroupEdit}
        />
      )
    ],
    [
      ActiveChatView.GroupEdit,
      (): JSX.Element => <GroupEdit onCancel={handleToChatInfo} />
    ]
  ]);

  const renderContent = (): JSX.Element => {
    const renderFunction = viewMap.get(activeChatView);

    if (renderFunction) {
      return renderFunction();
    }

    return <></>;
  };

  const handleOpenAddMembers = useCallback((): void => {
    setActiveChatView(ActiveChatView.AddMembers);
  }, []);

  const handleHeaderClick = useCallback(() => {
    setChatInfo(!isChatInfo);
    setActiveChatView(ActiveChatView.ChatInfo);
  }, [isChatInfo]);

  const handleToChatInfo = useCallback(() => {
    setActiveChatView(ActiveChatView.ChatInfo);
  }, []);

  const handleToGroupEdit = useCallback(() => {
    setActiveChatView(ActiveChatView.GroupEdit);
  }, []);

  useEffect(() => {
    setActiveChatView(ActiveChatView.ChatInfo);
  }, [chatId]);

  if (chatId !== chat?.id) {
    return <Navigate to={AppRoute.ROOT} />;
  }

  return (
    <div className={styles['chat-layout']}>
      <div className={styles['chat-content']}>
        <ChatHeader onHeaderClick={handleHeaderClick} />
        <div className={styles['chat-messages']}>
          <p>Messages goes here...</p>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export { Chat };
