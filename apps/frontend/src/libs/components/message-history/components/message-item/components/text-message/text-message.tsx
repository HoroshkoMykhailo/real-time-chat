import { type MessageHistoryItem } from '~/modules/messages/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  textMessage: MessageHistoryItem;
};

const TextMessage = ({ textMessage }: Properties): JSX.Element => {
  if (textMessage.translatedMessage) {
    return (
      <p className={styles['message-text']}>{textMessage.translatedMessage}</p>
    );
  }

  return <p className={styles['message-text']}>{textMessage.content}</p>;
};

export { TextMessage };
