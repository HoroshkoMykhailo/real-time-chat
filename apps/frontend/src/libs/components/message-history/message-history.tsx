import {
  MINUS_ONE_VALUE,
  ONE_HUNDRED,
  TWO_VALUE,
  ZERO_VALUE
} from '~/libs/common/constants.js';
import { Loader } from '~/libs/components/components.js';
import { DataStatus } from '~/libs/enums/enums.js';
import {
  formatDateLabel,
  groupMessagesByDate
} from '~/libs/helpers/helpers.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { chatActions } from '~/modules/chat/chat.js';
import { messageActions } from '~/modules/messages/message.js';

import { MessageItem } from './components/message-item/message-item.js';
import styles from './styles.module.scss';

type Properties = {
  isPinned?: boolean;
  setEditingMessageId?: (messageId: null | string) => void;
};

const MessageHistory = ({
  isPinned = false,
  setEditingMessageId
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);
  const [popoverMessageId, setPopoverMessageId] = useState<null | string>(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<
    null | string
  >(null);

  const [beforeMessageTime, setBeforeMessageTime] = useState<null | string>(
    null
  );
  const [afterMessageTime, setAfterMessageTime] = useState<null | string>(null);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const previousScrollHeightReference = useRef<number>(ZERO_VALUE);
  const messagesListReference = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hasScrolledToUnreadReference = useRef<boolean>(false);
  const lastViewedMessageTimeReference = useRef<null | string>(null);

  const {
    dataStatus,
    editDataStatus,
    isAfter,
    isBefore,
    lastViewedTime,
    loadDataStatus,
    messages,
    pinnedMessages,
    writeDataStatus
  } = useAppSelector(state => state.message);

  const findFirstUnreadMessage = useCallback(() => {
    if (!lastViewedTime) {
      return null;
    }

    const messageElements = messagesListReference.current?.querySelectorAll(
      '[data-message-time]'
    );

    if (!messageElements) {
      return null;
    }

    for (const element of messageElements) {
      const { messageTime } = (element as HTMLDivElement).dataset;

      if (messageTime && new Date(messageTime) > new Date(lastViewedTime)) {
        return {
          element: element as HTMLDivElement,
          messageId: (element as HTMLDivElement).dataset['messageId']
        };
      }
    }

    return null;
  }, [lastViewedTime]);

  const scrollToFirstUnreadMessage = useCallback(() => {
    if (
      !messagesListReference.current ||
      !lastViewedTime ||
      hasScrolledToUnreadReference.current
    ) {
      return;
    }

    const unreadMessage = findFirstUnreadMessage();

    if (unreadMessage && unreadMessage.messageId) {
      setFirstUnreadMessageId(unreadMessage.messageId);
      unreadMessage.element.scrollIntoView({
        behavior: 'auto',
        block: 'center'
      });
      hasScrolledToUnreadReference.current = true;
    } else {
      messagesListReference.current.scrollTop =
        messagesListReference.current.scrollHeight;
    }
  }, [findFirstUnreadMessage, lastViewedTime]);

  const updateLastViewedMessage = useCallback(() => {
    if (!messagesListReference.current) {
      return;
    }

    const listElement = messagesListReference.current;
    const messageElements = listElement.querySelectorAll('[data-message-time]');
    let lastVisibleMessageTime: null | string = null;

    for (const element of messageElements) {
      const rect = element.getBoundingClientRect();
      const listRect = listElement.getBoundingClientRect();

      if (
        rect.top + TWO_VALUE >= listRect.top &&
        rect.bottom - TWO_VALUE <= listRect.bottom &&
        rect.height <= listRect.height
      ) {
        const { messageTime } = (element as HTMLDivElement).dataset;

        if (
          messageTime &&
          (!lastVisibleMessageTime ||
            new Date(messageTime) > new Date(lastVisibleMessageTime))
        ) {
          lastVisibleMessageTime = messageTime;
        }
      }
    }

    if (
      lastVisibleMessageTime &&
      (!lastViewedMessageTimeReference.current ||
        new Date(lastVisibleMessageTime) >
          new Date(lastViewedMessageTimeReference.current))
    ) {
      lastViewedMessageTimeReference.current = lastVisibleMessageTime;

      if (chat) {
        void dispatch(
          chatActions.updateLastViewedTime({
            id: chat.id,
            lastViewedMessageTime: lastVisibleMessageTime
          })
        );
      }
    }
  }, [chat, dispatch]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>): void => {
      event.preventDefault();
      event.stopPropagation();
      const element = event.currentTarget;

      if (scrollTimeoutReference.current) {
        clearTimeout(scrollTimeoutReference.current);
      }

      const scrollData = {
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        scrollTop: element.scrollTop
      };

      const isAtTop = scrollData.scrollTop <= ONE_HUNDRED;
      const isAtBottom =
        scrollData.scrollTop + scrollData.clientHeight >=
        scrollData.scrollHeight - ONE_HUNDRED;

      if (
        isBefore &&
        isAtTop &&
        !beforeMessageTime &&
        loadDataStatus !== DataStatus.PENDING
      ) {
        const element = messagesListReference.current;
        const message = messages.at(ZERO_VALUE);

        if (element) {
          previousScrollHeightReference.current = element.scrollHeight;
        }

        if (message) {
          setBeforeMessageTime(message.createdAt);
        }
      }

      if (
        isAfter &&
        isAtBottom &&
        !afterMessageTime &&
        loadDataStatus !== DataStatus.PENDING
      ) {
        const element = messagesListReference.current;
        const message = messages.at(MINUS_ONE_VALUE);

        if (element) {
          previousScrollHeightReference.current = element.scrollHeight;
        }

        if (message) {
          setAfterMessageTime(message.createdAt);
        }
      }

      scrollTimeoutReference.current = setTimeout(() => {
        updateLastViewedMessage();
      }, ONE_HUNDRED);
    },
    [
      afterMessageTime,
      beforeMessageTime,
      isAfter,
      isBefore,
      loadDataStatus,
      messages,
      updateLastViewedMessage
    ]
  );

  useEffect(() => {
    const element = messagesListReference.current;
    setIsHidden(true);

    if (element) {
      hasScrolledToUnreadReference.current = false;
      scrollToFirstUnreadMessage();
    }

    if (lastViewedTime) {
      lastViewedMessageTimeReference.current = lastViewedTime;
    }

    dispatch(messageActions.resetBeforeAfter());
    setBeforeMessageTime(null);
    setAfterMessageTime(null);
    updateLastViewedMessage();
    setTimeout(() => {
      setIsHidden(false);
    }, ONE_HUNDRED);
  }, [
    chat,
    dispatch,
    lastViewedTime,
    scrollToFirstUnreadMessage,
    updateLastViewedMessage
  ]);

  useEffect(() => {
    if (editDataStatus === DataStatus.FULFILLED) {
      const message = messages.at(ZERO_VALUE);

      dispatch(messageActions.resetEditDataStatus());

      if (message) {
        dispatch(
          chatActions.updateLastMessage({
            chatId: message.chatId,
            message: {
              content: message.content,
              createdAt: message.createdAt,
              senderName: message.sender.username,
              type: message.type,
              ...(message.fileUrl && { fileUrl: message.fileUrl })
            }
          })
        );
      } else if (chat) {
        dispatch(
          chatActions.resetLastMessage({
            chatId: chat.id
          })
        );
      }
    }
  }, [chat, dispatch, editDataStatus, messages]);

  useEffect(() => {
    return (): void => {
      if (scrollTimeoutReference.current) {
        clearTimeout(scrollTimeoutReference.current);
      }
    };
  }, [chat]);

  useEffect(() => {
    if (loadDataStatus === DataStatus.FULFILLED) {
      const element = messagesListReference.current;

      if (element) {
        const newScrollHeight = element.scrollHeight;
        const scrollDelta =
          newScrollHeight - previousScrollHeightReference.current;

        element.scrollTop += scrollDelta;
      }

      dispatch(messageActions.resetLoadDataStatus());
    }
  }, [dispatch, loadDataStatus]);

  useEffect(() => {
    if (!chat) {
      return;
    }

    if (beforeMessageTime) {
      void dispatch(
        messageActions.loadBeforeMessages({
          beforeTime: beforeMessageTime,
          chatId: chat.id
        })
      );

      setBeforeMessageTime(null);
    }

    if (afterMessageTime) {
      void dispatch(
        messageActions.loadAfterMessages({
          afterTime: afterMessageTime,
          chatId: chat.id
        })
      );

      setAfterMessageTime(null);
    }
  }, [dispatch, beforeMessageTime, chat, afterMessageTime]);

  useEffect(() => {
    if (writeDataStatus === DataStatus.FULFILLED) {
      const element = messagesListReference.current;

      if (element) {
        element.scrollTop = element.scrollHeight;
        setTimeout(updateLastViewedMessage, ONE_HUNDRED);
      }
    }
  }, [writeDataStatus, updateLastViewedMessage]);

  if (!chat || !profile) {
    return <></>;
  }

  const historyMessages = isPinned ? pinnedMessages : messages;

  if (dataStatus === DataStatus.PENDING) {
    return <Loader />;
  }

  const groupedMessages = groupMessagesByDate(historyMessages);

  return (
    <div className={styles['messages-list-wrapper']}>
      <div
        className={`${styles['messages-list']} ${isHidden ? styles['hidden'] : ''}`}
        onScroll={handleScroll}
        ref={messagesListReference}
      >
        {Object.entries(groupedMessages).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className={styles['date-label-wrapper']}>
              <div className={styles['date-label']}>
                {formatDateLabel(dateKey, profile.language)}
              </div>
            </div>
            {messages.map(message => (
              <div
                data-message-id={message.id}
                data-message-time={message.createdAt}
                key={message.id}
              >
                {message.id === firstUnreadMessageId && (
                  <div className={styles['unread-messages-label-wrapper']}>
                    <div className={styles['unread-messages-label']}>
                      {translate.translate('unreadMessages', profile.language)}
                    </div>
                  </div>
                )}
                <MessageItem
                  message={message}
                  popoverMessageId={popoverMessageId}
                  setPopoverMessageId={setPopoverMessageId}
                  {...(setEditingMessageId && { setEditingMessageId })}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export { MessageHistory };
