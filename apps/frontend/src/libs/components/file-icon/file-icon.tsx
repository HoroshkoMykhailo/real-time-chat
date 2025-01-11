import { TWO_VALUE } from '~/libs/common/constants.js';

import { Icon } from '../icon/icon.js';
import styles from './styles.module.scss';

const DEFAULT_SIZE = 48;

type Properties = {
  height?: number;
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  width?: number;
};

const FileIcon = ({
  height = DEFAULT_SIZE,
  href,
  onClick,
  width = DEFAULT_SIZE
}: Properties): JSX.Element => {
  return (
    <div className={styles['file-icon-container']} style={{ height, width }}>
      <Icon height={height} name="file" width={width} />
      <a
        className={styles['download-icon']}
        href={href}
        onClick={onClick}
        style={{ height, width }}
        title="Download file"
      >
        <Icon
          height={height / TWO_VALUE}
          name="download"
          width={width / TWO_VALUE}
        />
      </a>
    </div>
  );
};

export { FileIcon };
