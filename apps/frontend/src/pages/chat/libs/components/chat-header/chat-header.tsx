import { ONE_VALUE } from '~/libs/common/constants.js';
import { ChatPicture, MessagePreview } from '~/libs/components/components.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { ChatType } from '~/modules/chat/chat.js';

import styles from './styles.module.scss';

type Properties = {
  onHeaderClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const ChatHeader = ({ onHeaderClick }: Properties): JSX.Element => {
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);

  if (!chat || !profile) {
    return <></>;
  }

  const { chatPicture, memberCount, name } = chat;

  const memberLabel =
    (chat.members?.length || memberCount) === ONE_VALUE
      ? translate.translate('member', profile.language)
      : translate.translate('members', profile.language);

  return (
    <button className={styles['chat-header']} onClick={onHeaderClick}>
      <ChatPicture isCircular name={name} picture={chatPicture} />
      <div
        className={
          chat.type === ChatType.PRIVATE
            ? `${styles['chat-info']} ${styles['private']}`
            : styles['chat-info']
        }
      >
        <h2 className={styles['chat-name']}>{name}</h2>
        <p className={styles['chat-users']}>
          {chat.type === ChatType.GROUP && (chat.members || memberCount)
            ? `${chat.members?.length ?? memberCount} ${memberLabel}`
            : ''}
        </p>
      </div>
      {chat.lastPinnedMessage && (
        <div className={styles['last-pinned-message-wrapper']}>
          <div className={styles['last-pinned-message-container']}>
            <div className={styles['last-pinned-message-header']}>
              {translate.translate('pinnedMessages', profile.language)}
            </div>
            <div className={styles['last-pinned-message']}>
              <MessagePreview
                message={chat.lastPinnedMessage}
                type={chat.type}
              />
            </div>
          </div>
        </div>
      )}
    </button>
  );
};

export { ChatHeader };
