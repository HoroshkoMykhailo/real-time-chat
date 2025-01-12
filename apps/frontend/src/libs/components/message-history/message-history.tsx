import { ZERO_VALUE } from '~/libs/common/constants.js';
import { Loader } from '~/libs/components/components.js';
import { DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';
import { messageActions } from '~/modules/messages/message.js';

import { MessageItem } from './libs/components/message-item.tsx/message-item.js';
import styles from './styles.module.scss';

type Properties = {
  setEditingMessageId: (messageId: null | string) => void;
};

const MessageHistory = ({ setEditingMessageId }: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const [popoverMessageId, setPopoverMessageId] = useState<null | string>(null);

  const { dataStatus, editDataStatus, messages } = useAppSelector(
    state => state.message
  );

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

  if (!chat) {
    return <></>;
  }

  if (dataStatus === DataStatus.PENDING) {
    return <Loader />;
  }

  return (
    <div className={`${styles['messages-list']}`}>
      {messages.map(message => (
        <MessageItem
          key={message.id}
          message={message}
          popoverMessageId={popoverMessageId}
          setEditingMessageId={setEditingMessageId}
          setPopoverMessageId={setPopoverMessageId}
        />
      ))}
    </div>
  );
};

export { MessageHistory };
