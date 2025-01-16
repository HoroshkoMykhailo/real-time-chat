import { ENV } from '~/libs/enums/enums.js';
import { type MessageCreationResponseDto } from '~/modules/messages/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  videoMessage: MessageCreationResponseDto;
};

const VideoMessage = ({ videoMessage }: Properties): JSX.Element => {
  const videoUrl = `${ENV.SERVER_URL}${videoMessage.fileUrl}`;

  return (
    <video
      className={styles['message-video']}
      controls
      controlsList="nodownload"
      preload="metadata"
    >
      <source src={videoUrl} />
      Your browser does not support the video tag.
    </video>
  );
};

export { VideoMessage };
