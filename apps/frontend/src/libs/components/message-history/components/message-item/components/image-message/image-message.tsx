import { Image } from '~/libs/components/components.js';
import { ENV } from '~/libs/enums/enums.js';
import { type MessageCreationResponseDto } from '~/modules/messages/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  imageMessage: MessageCreationResponseDto;
};

const ImageMessage = ({ imageMessage }: Properties): JSX.Element => {
  const imageUrl = `${ENV.SERVER_URL}${imageMessage.fileUrl}`;

  return (
    <Image
      alt={imageMessage.content}
      className={styles['message-image'] ?? ''}
      src={imageUrl}
    />
  );
};

export { ImageMessage };
