import { Icon } from '~/libs/components/components.js';
import { usePopover } from '~/libs/hooks/hooks.js';

import { FilePopover } from './components/file-popover/file-popover.js';
import styles from './styles.module.scss';

const FilesInput = (): JSX.Element => {
  const {
    isOpened: isFileOpened,
    onClose: onFileClose,
    onOpen: onFileOpen
  } = usePopover();

  return (
    <FilePopover isOpened={isFileOpened} onClose={onFileClose}>
      <button
        className={styles['icon-button']}
        onClick={onFileClose}
        onMouseEnter={onFileOpen}
      >
        <Icon height={24} name="paperClip" width={24} />
      </button>
    </FilePopover>
  );
};

export { FilesInput };
