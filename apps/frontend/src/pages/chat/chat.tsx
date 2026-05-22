import { Navigate } from 'react-router-dom';

import { Icon, Loader, MessageHistory } from '~/libs/components/components.js';
import { AppRoute, DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useParams,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type ValueOf } from '~/libs/types/types.js';
import { chatActions } from '~/modules/chat/chat.js';
import { messageActions } from '~/modules/messages/message.js';

import { AddMembers } from './libs/components/add-members/add-members.js';
import { ChatHeader } from './libs/components/chat-header/chat-header.js';
import chatHeaderstyles from './libs/components/chat-header/styles.module.scss';
import { ChatInfo } from './libs/components/chat-info/chat-info.js';
import { ChatSummaryPanel } from './libs/components/chat-summary-panel/chat-summary-panel.js';
import { GroupEdit } from './libs/components/group-edit/group-edit.js';
import { MessageInput } from './libs/components/message-input/message-input.js';
import { PinnedHeader } from './libs/components/pinned-header/pinned-header.js';
import { ActiveChatView } from './libs/enums/active-chat-view.js';
import styles from './styles.module.scss';

const Chat: React.FC = () => {
  const dispatch = useAppDispatch();
  const { id: chatId } = useParams<{ id: string }>();
  const {
    chats,
    createdChat,
    dataStatus,
    selectedChat: chat
  } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);
  const [activeChatView, setActiveChatView] = useState<
    ValueOf<typeof ActiveChatView>
  >(ActiveChatView.ChatInfo);
  const [isPinnedMessage, setIsPinnedMessage] = useState<boolean>(false);
  const [isChatInfo, setChatInfo] = useState<boolean>(false);
  const [editingMessageId, setEditingMessageId] = useState<null | string>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const lastDetailFetchChatIdReference = useRef<null | string>(null);

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

  const handleCloseSummaryPanel = useCallback(() => {
    setIsSummaryOpen(false);
  }, []);

  const handleOpenSummaryPanel = useCallback(() => {
    setIsSummaryOpen(true);
  }, []);

  useEffect(() => {
    setIsSummaryOpen(false);
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      lastDetailFetchChatIdReference.current = null;

      return;
    }

    const chatFromList = chats.find(item => item.id === chatId);

    if (chatFromList) {
      dispatch(chatActions.setSelectedChat(chatFromList));

      if (lastDetailFetchChatIdReference.current !== chatId) {
        lastDetailFetchChatIdReference.current = chatId;
        void dispatch(chatActions.getChat({ id: chatId }));
        void dispatch(messageActions.getMessages({ chatId }));
      }
    }

    void dispatch(
      messageActions.getPinnedMessages({
        chatId
      })
    );

    setActiveChatView(ActiveChatView.ChatInfo);
    setIsPinnedMessage(false);
    dispatch(chatActions.resetCreatedChat());
  }, [chatId, chats, dispatch]);

  const chatInList = chatId ? chats.some(item => item.id === chatId) : false;
  const isCreatedChatRoute = Boolean(
    chatId && createdChat && createdChat.id === chatId
  );

  if (
    chatId &&
    (dataStatus === DataStatus.IDLE || dataStatus === DataStatus.PENDING)
  ) {
    return <Loader />;
  }

  if (chatId && dataStatus === DataStatus.REJECTED) {
    return <Navigate replace to={AppRoute.ROOT} />;
  }

  if (
    chatId &&
    dataStatus === DataStatus.FULFILLED &&
    !chatInList &&
    !isCreatedChatRoute
  ) {
    return <Navigate replace to={AppRoute.ROOT} />;
  }

  if (
    chatId &&
    dataStatus === DataStatus.FULFILLED &&
    chat?.id !== chatId &&
    !isCreatedChatRoute
  ) {
    return <Loader />;
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
            <div className={styles['chat-header-row']}>
              <div className={styles['chat-header-main']}>
                <ChatHeader onHeaderClick={handleHeaderClick} />
              </div>
              {profile && chatId ? (
                <button
                  className={styles['summary-action']}
                  onClick={handleOpenSummaryPanel}
                  type="button"
                >
                  <span
                    aria-hidden
                    className={styles['summary-action-icon-wrap']}
                  >
                    <Icon height={20} name="file" width={20} />
                  </span>
                  <span className={styles['summary-action-text']}>
                    {translate.translate('chatSummary', profile.language)}
                  </span>
                </button>
              ) : null}
            </div>
            <MessageHistory setEditingMessageId={setEditingMessageId} />
            <MessageInput
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
            />
          </>
        )}
      </div>
      {chatId ? (
        <ChatSummaryPanel
          chatId={chatId}
          isOpen={isSummaryOpen}
          onClose={handleCloseSummaryPanel}
        />
      ) : null}
      {renderContent()}
    </div>
  );
};

export { Chat };
