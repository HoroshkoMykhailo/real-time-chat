import { ENV } from '~/libs/enums/enums.js';
import { type GetMessagesResponseDto } from '~/modules/messages/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  audioMessage: GetMessagesResponseDto[number];
};

const AudioMessage = ({ audioMessage }: Properties): JSX.Element => {
  const audioUrl = `${ENV.SERVER_URL}${audioMessage.fileUrl}`;

  return (
    <audio
      className={styles['message-audio']}
      controls
      controlsList="nodownload"
      preload="metadata"
    >
      <source src={audioUrl} />
      Your browser does not support the audio element.
    </audio>
  );
};

export { AudioMessage };
