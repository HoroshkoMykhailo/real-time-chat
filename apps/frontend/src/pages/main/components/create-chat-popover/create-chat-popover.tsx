import { Icon, Popover } from '~/libs/components/components.js';
import { useRef } from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

const CHAT_POPOVER_CLASS = 'chat-popover';

type Properties = {
  children: React.ReactNode;
  isOpened: boolean;
  onClose: () => void;
};

const CreateChatPopover = ({
  children,
  isOpened,
  onClose
}: Properties): JSX.Element => {
  const popoverReference = useRef<HTMLDivElement | null>(null);

  return (
    <Popover
      className="create-chat-popover"
      content={
        <div className={styles[CHAT_POPOVER_CLASS]} ref={popoverReference}>
          <div className={styles['buttons']}>
            <button className={styles['button']}>
              <Icon height={24} name="group" width={24} />
              <span>New group</span>
            </button>
            <button className={styles['button']}>
              <Icon height={24} name="person" width={24} />
              <span>New chat</span>
            </button>
          </div>
        </div>
      }
      isOpened={isOpened}
      onClose={onClose}
    >
      {children}
    </Popover>
  );
};

export { CreateChatPopover };
