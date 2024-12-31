import { Image } from '~/libs/components/components.js';
import { getValidClassNames } from '~/libs/helpers/helpers.js';

import styles from './styles.module.scss';

type Properties = {
  name: string;
  picture?: string | undefined;
};

const FIRST_LETTER_INDEX = 0;

const ChatPicture = ({ name, picture }: Properties): JSX.Element => {
  const firstLetter = name[FIRST_LETTER_INDEX];
  const hasImage = Boolean(picture);

  const imageUrl = `${import.meta.env['VITE_APP_PROXY_SERVER_URL']}${picture}`;

  return (
    <div
      className={getValidClassNames(
        styles['avatar'],
        !picture && styles['no-image']
      )}
    >
      {hasImage ? (
        <Image
          alt="Selected"
          height="56"
          isCircular
          src={imageUrl}
          width="56"
        />
      ) : (
        <span className={styles['avatar-letter']}>{firstLetter}</span>
      )}
    </div>
  );
};

export { ChatPicture };
