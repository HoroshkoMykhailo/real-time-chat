import { Icon } from '~/libs/components/components.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type ValueOf } from '~/libs/types/types.js';
import { type MessageHistoryItem } from '~/modules/messages/libs/types/types.js';
import { MessageType } from '~/modules/messages/message.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  language: ValueOf<typeof ProfileLanguage>;
  message: MessageHistoryItem;
};

const MessageFooter = ({ language, message }: Properties): JSX.Element => {
  const isEdited = message.createdAt !== message.updatedAt;

  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={styles['message-footer']}>
      {message.translatedMessage && (
        <Icon height={14} name="translate" width={14} />
      )}
      {isEdited && message.type === MessageType.TEXT && (
        <span className={styles['edited-marker']}>
          {' '}
          ({translate.translate('edited', language)})
        </span>
      )}
      <span className={styles['message-time']}>{timeString}</span>
    </div>
  );
};

export { MessageFooter };
