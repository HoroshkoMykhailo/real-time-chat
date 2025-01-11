import { Icon, Popover } from '~/libs/components/components.js';

import styles from './styles.module.scss';

type Properties = {
  children: React.ReactNode;
  isOpened: boolean;
  onClose: () => void;
};

const FilePopover = ({
  children,
  isOpened,
  onClose
}: Properties): JSX.Element => {
  return (
    <Popover
      className="file-popover"
      content={
        <div className={styles['file-popover']}>
          <div className={styles['buttons']}>
            <button className={styles['button']}>
              <Icon height={24} name="image" width={24} />
              Photo or video
            </button>
            <button className={styles['button']}>
              <Icon height={24} name="file" width={24} />
              File
            </button>
          </div>
        </div>
      }
      isOpened={isOpened}
      onClose={onClose}
      onMouseLeave={onClose}
    >
      {children}
    </Popover>
  );
};

export { FilePopover };
