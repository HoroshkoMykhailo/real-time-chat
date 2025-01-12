import { type GetMessagesResponseDto } from '~/modules/messages/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  message: GetMessagesResponseDto[number];
};

const MessageFooter = ({ message }: Properties): JSX.Element => {
  const isEdited = message.createdAt !== message.updatedAt;

  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={styles['message-footer']}>
      {isEdited && <span className={styles['edited-marker']}> (edited)</span>}
      <span className={styles['message-time']}>{timeString}</span>
    </div>
  );
};

export { MessageFooter };
