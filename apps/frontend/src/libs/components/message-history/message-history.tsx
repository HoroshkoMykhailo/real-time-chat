import { ONE_HUNDRED, ZERO_VALUE } from '~/libs/common/constants.js';
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

  const [beforeMessageTime, setBeforeMessageTime] = useState<null | string>(
    null
  );
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const previousScrollHeightReference = useRef<number>(ZERO_VALUE);

  const messagesListReference = useRef<HTMLDivElement | null>(null);

  const {
    dataStatus,
    editDataStatus,
    loadDataStatus,
    messages,
    pinnedMessages,
    writeDataStatus
  } = useAppSelector(state => state.message);

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
    const element = messagesListReference.current;
    setIsHidden(true);

    if (element) {
      element.scrollTop = element.scrollHeight;
    }

    setBeforeMessageTime(null);
    setTimeout(() => {
      setIsHidden(false);
    }, ONE_HUNDRED);
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
  }, [dispatch, beforeMessageTime, chat]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>): void => {
      event.preventDefault();
      event.stopPropagation();
      const element = event.currentTarget;

      const scrollData = {
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        scrollTop: element.scrollTop
      };

      const isAtTop = scrollData.scrollTop <= ONE_HUNDRED;

      if (
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
    },
    [beforeMessageTime, loadDataStatus, messages]
  );

  useEffect(() => {
    if (writeDataStatus === DataStatus.FULFILLED) {
      const element = messagesListReference.current;

      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }
  }, [editDataStatus, writeDataStatus]);

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
              <MessageItem
                key={message.id}
                message={message}
                popoverMessageId={popoverMessageId}
                setPopoverMessageId={setPopoverMessageId}
                {...(setEditingMessageId && { setEditingMessageId })}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export { MessageHistory };
