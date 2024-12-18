import clsx from 'clsx';

import { type ImageSize } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import styles from './styles.module.scss';

type ImageProperties = {
  alt: string;
  children?: React.ReactNode;
  className?: string;
  height?: string;
  isCentered?: boolean;
  isCircular?: boolean;
  size?: ValueOf<typeof ImageSize>;
  src?: string;
  width?: string;
};

const Image: React.FC<ImageProperties> = ({
  alt,
  children,
  className,
  height,
  isCentered,
  isCircular,
  size,
  src,
  width
}) => {
  if (children) {
    return (
      <div
        aria-label={alt}
        className={clsx(
          styles['image'],
          isCircular && styles['circular'],
          isCentered && styles['centered'],
          size && styles[`imageSize__${size}`],
          className
        )}
        style={{ height, width }}
      >
        {children}
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={clsx(
        styles['image'],
        isCircular && styles['circular'],
        isCentered && styles['centered'],
        size && styles[`imageSize__${size}`],
        className
      )}
      height={height}
      src={src}
      width={width}
    />
  );
};

export { Image };
