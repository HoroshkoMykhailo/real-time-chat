import { Image } from '~/libs/components/components.js';
import { ENV } from '~/libs/enums/enums.js';
import { Zero, getValidClassNames } from '~/libs/helpers/helpers.js';

import styles from './styles.module.scss';

const FONT_DIVISOR = 3;

type Properties = {
  height?: string;
  isCircular?: boolean;
  name: string;
  picture?: string | undefined;
  size?: string;
  width?: string;
};

const ChatPicture = ({
  height = '56',
  isCircular = false,
  name,
  picture,
  size,
  width = '56'
}: Properties): JSX.Element => {
  const firstLetter = name[Zero];
  const hasImage = Boolean(picture);

  const imageUrl = `${ENV.SERVER_URL}${picture}`;

  if (size) {
    height = size;
    width = size;
  }

  const dynamicHeight =
    typeof height === 'string' ? Number.parseInt(height, 10) : height;

  const dynamicWidth =
    typeof width === 'string' ? Number.parseInt(width, 10) : width;

  const fontSize = Math.min(dynamicHeight, dynamicWidth) / FONT_DIVISOR;

  return (
    <div
      className={getValidClassNames(
        styles['chat-picture'],
        isCircular && styles['circular'],
        !picture && styles['no-image']
      )}
      style={{
        height: dynamicHeight,
        width: dynamicWidth
      }}
    >
      {hasImage ? (
        <Image
          alt="Selected"
          height={height}
          isCircular={isCircular}
          src={imageUrl}
          width={width}
        />
      ) : (
        <span
          className={styles['chat-picture-letter']}
          style={{ fontSize: `${fontSize}px` }}
        >
          {firstLetter}
        </span>
      )}
    </div>
  );
};

export { ChatPicture };
