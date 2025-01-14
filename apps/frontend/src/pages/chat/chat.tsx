import { Navigate } from 'react-router-dom';

import { MessageHistory } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useParams,
  useState
} from '~/libs/hooks/hooks.js';
import { type ValueOf } from '~/libs/types/types.js';
import { chatActions } from '~/modules/chat/chat.js';
import { messageActions } from '~/modules/messages/message.js';

import { AddMembers } from './libs/components/add-members/add-members.js';
import { ChatHeader } from './libs/components/chat-header/chat-header.js';
import chatHeaderstyles from './libs/components/chat-header/styles.module.scss';
import { ChatInfo } from './libs/components/chat-info/chat-info.js';
import { GroupEdit } from './libs/components/group-edit/group-edit.js';
import { MessageInput } from './libs/components/message-input/message-input.js';
import { PinnedHeader } from './libs/components/pinned-header/pinned-header.js';
import { ActiveChatView } from './libs/enums/active-chat-view.js';
import styles from './styles.module.scss';

const Chat: React.FC = () => {
  const dispatch = useAppDispatch();
  const { id: chatId } = useParams<{ id: string }>();
  const { createdChat, selectedChat: chat } = useAppSelector(
    state => state.chat
  );
  const [activeChatView, setActiveChatView] = useState<
    ValueOf<typeof ActiveChatView>
  >(ActiveChatView.ChatInfo);
  const [isPinnedMessage, setIsPinnedMessage] = useState<boolean>(false);
  const [isChatInfo, setChatInfo] = useState<boolean>(false);
  const [editingMessageId, setEditingMessageId] = useState<null | string>(null);

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

  const handleHeaderClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const isPinMessageContainerClick = (event.target as HTMLElement).closest(
        `.${chatHeaderstyles['last-pinned-message-container']}`
      );

      if (isPinMessageContainerClick && chatId) {
        void dispatch(
          messageActions.getPinnedMessages({
            chatId
          })
        );
        setIsPinnedMessage(!isPinnedMessage);
      } else {
        setChatInfo(!isChatInfo);
        setActiveChatView(ActiveChatView.ChatInfo);
      }
    },
    [chatId, dispatch, isChatInfo, isPinnedMessage]
  );

  const handleToChatInfo = useCallback(() => {
    setActiveChatView(ActiveChatView.ChatInfo);
  }, []);

  const handlePinHeaderClick = useCallback(() => {
    setIsPinnedMessage(!isPinnedMessage);
  }, [isPinnedMessage]);

  const handleToGroupEdit = useCallback(() => {
    setActiveChatView(ActiveChatView.GroupEdit);
  }, []);

  useEffect(() => {
    setActiveChatView(ActiveChatView.ChatInfo);
    dispatch(chatActions.resetCreatedChat());
  }, [chatId, dispatch]);

  if (chatId !== chat?.id && !createdChat) {
    return <Navigate replace to={AppRoute.ROOT} />;
  }

  return (
    <div className={styles['chat-layout']}>
      <div className={styles['chat-content']}>
        {isPinnedMessage ? (
          <>
            <PinnedHeader onBackClick={handlePinHeaderClick} />
            <MessageHistory isPinned={isPinnedMessage} />
          </>
        ) : (
          <>
            <ChatHeader onHeaderClick={handleHeaderClick} />
            <MessageHistory setEditingMessageId={setEditingMessageId} />
            <MessageInput
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
            />
          </>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export { Chat };
