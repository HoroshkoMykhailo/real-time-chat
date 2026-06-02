import {
  getValidClassNames,
  resolveServerMediaUrl,
  Zero
} from '~/libs/helpers/helpers.js';

import { Image } from '../image/image.js';
import styles from './styles.module.scss';

type Properties = {
  name: string;
  picture?: string | undefined;
};

const Avatar = ({ name, picture }: Properties): JSX.Element => {
  const firstLetter = name[Zero];
  const hasImage = Boolean(picture);

  const imageUrl = resolveServerMediaUrl(picture);

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
          height="40"
          isCircular
          src={imageUrl}
          width="40"
        />
      ) : (
        <span className={styles['avatar-letter']}>{firstLetter}</span>
      )}
    </div>
  );
};

export { Avatar };
