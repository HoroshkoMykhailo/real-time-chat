import { Icon, Popover } from '~/libs/components/components.js';
import { useAppDispatch, useCallback } from '~/libs/hooks/hooks.js';
import { authActions } from '~/modules/auth/auth.js';

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
  const dispatch = useAppDispatch();

  const handleLogout = useCallback((): void => {
    void dispatch(authActions.logout());
  }, [dispatch]);

  return (
    <Popover
      className="file-popover"
      content={
        <div className={styles['file-popover']}>
          <div className={styles['buttons']}>
            <button className={styles['button']} onClick={handleLogout}>
              <Icon height={24} name="image" width={24} />
              Picture
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
