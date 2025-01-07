import { Icon } from '~/libs/components/components.js';

import styles from './styles.module.scss';

interface Properties {
  chatTypeLabel: string;
  isAdmin: boolean;
  onClose: () => void;
  onOpenChatInfoChange: () => void;
}

const ChatInfoHeader = ({
  chatTypeLabel,
  isAdmin,
  onClose,
  onOpenChatInfoChange
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
      <div className={styles['header-right']}>
        {isAdmin && (
          <button className={styles['button']} onClick={onOpenChatInfoChange}>
            <Icon height={16} name="pencil" width={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export { ChatInfoHeader };
