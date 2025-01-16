import { ENV } from '~/libs/enums/enums.js';
import { type MessageCreationResponseDto } from '~/modules/messages/libs/types/types.js';

import { TextMessage } from '../components.js';
import styles from './styles.module.scss';

type Properties = {
  audioMessage: MessageCreationResponseDto;
};

const AudioMessage = ({ audioMessage }: Properties): JSX.Element => {
  const audioUrl = `${ENV.SERVER_URL}${audioMessage.fileUrl}`;

  return (
    <>
      <audio
        className={styles['message-audio']}
        controls
        controlsList="nodownload"
        preload="metadata"
      >
        <source src={audioUrl} />
        Your browser does not support the audio element.
      </audio>
      {audioMessage.content && (
        <div className={styles['transcribed-message']}>
          <TextMessage textMessage={audioMessage} />
        </div>
      )}
    </>
  );
};

export { AudioMessage };
