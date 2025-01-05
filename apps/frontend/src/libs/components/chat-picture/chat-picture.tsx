import { Image } from '~/libs/components/components.js';
import { Zero, getValidClassNames } from '~/libs/helpers/helpers.js';

import styles from './styles.module.scss';

type Properties = {
  name: string;
  picture?: string | undefined;
  size?: string;
};

const ChatPicture = ({
  name,
  picture,
  size = '56'
}: Properties): JSX.Element => {
  const firstLetter = name[Zero];
  const hasImage = Boolean(picture);

  const imageUrl = `${import.meta.env['VITE_APP_PROXY_SERVER_URL']}${picture}`;

  const dynamicSize =
    typeof size === 'string' ? Number.parseInt(size, 10) : size;

  return (
    <div
      className={getValidClassNames(
        styles['avatar'],
        !picture && styles['no-image']
      )}
      style={{
        height: dynamicSize,
        width: dynamicSize
      }}
    >
      {hasImage ? (
        <Image
          alt="Selected"
          height={size}
          isCircular
          src={imageUrl}
          width={size}
        />
      ) : (
        <span className={styles['avatar-letter']}>{firstLetter}</span>
      )}
    </div>
  );
};

export { ChatPicture };
