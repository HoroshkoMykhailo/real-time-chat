import { Icon, Popover } from '~/libs/components/components.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';

import styles from './styles.module.scss';

type Properties = {
  children: React.ReactNode;
  isOpened: boolean;
  onClose: () => void;
  onCreateChat: () => void;
  onCreateGroup: () => void;
};

const CreateChatPopover = ({
  children,
  isOpened,
  onClose,
  onCreateChat,
  onCreateGroup
}: Properties): JSX.Element => {
  const { profile } = useAppSelector(state => state.profile);

  if (!profile) {
    return <></>;
  }

  return (
    <Popover
      className="create-default-popover"
      content={
        <div className={styles['create-default-popover']}>
          <div className={styles['buttons']}>
            <button className={styles['button']} onClick={onCreateGroup}>
              <Icon height={24} name="group" width={24} />
              <span>{translate.translate('newGroup', profile.language)}</span>
            </button>
            <button className={styles['button']} onClick={onCreateChat}>
              <Icon height={24} name="person" width={24} />
              <span>{translate.translate('newChat', profile.language)}</span>
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
