import { Icon } from '~/libs/components/components.js';

import styles from './styles.module.scss';

interface Properties {
  chatTypeLabel: string;
  isAdmin: boolean;
  onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDeleteChat: () => void;
  onOpenGroupEdit: () => void;
}

const ChatInfoHeader = ({
  chatTypeLabel,
  isAdmin,
  onClose,
  onDeleteChat,
  onOpenGroupEdit
}: Properties): JSX.Element => {
  return (
    <div className={styles['chat-info-header']}>
      <div className={styles['header-left']}>
        <button
          aria-label="Close Chat Info"
          className={styles['button']}
          onClick={onClose}
        >
          <Icon height={16} name="cancel" width={16} />
        </button>
        <h2 className={styles['chat-info-title']}>{chatTypeLabel}</h2>
      </div>
      {isAdmin && (
        <div className={styles['header-right']}>
          <button className={styles['button']} onClick={onOpenGroupEdit}>
            <Icon height={16} name="pencil" width={16} />
          </button>
          <button
            className={`${styles['button']} ${styles['delete-button']}`}
            onClick={onDeleteChat}
          >
            <Icon height={16} name="trashBin" width={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export { ChatInfoHeader };
