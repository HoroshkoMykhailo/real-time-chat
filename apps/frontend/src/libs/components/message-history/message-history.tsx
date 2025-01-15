import { ZERO_VALUE } from '~/libs/common/constants.js';
import { Loader } from '~/libs/components/components.js';
import { DataStatus } from '~/libs/enums/enums.js';
import {
  formatDateLabel,
  groupMessagesByDate
} from '~/libs/helpers/helpers.js';
import {
  useAppDispatch,
  useAppSelector,
  useEffect,
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

  const { dataStatus, editDataStatus, messages, pinnedMessages } =
    useAppSelector(state => state.message);

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

  if (!chat || !profile) {
    return <></>;
  }

  const historyMessages = isPinned ? pinnedMessages : messages;

  if (dataStatus === DataStatus.PENDING) {
    return <Loader />;
  }

  const groupedMessages = groupMessagesByDate(historyMessages);

  return (
    <div className={styles['messages-list']}>
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
  );
};

export { MessageHistory };
