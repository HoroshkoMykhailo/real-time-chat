import { NavLink } from 'react-router-dom';

import { Popover } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { leaveChatRoom } from '~/libs/modules/socket/socket.js';
import { type ValueOf } from '~/libs/types/types.js';
import { authActions } from '~/modules/auth/auth.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  children: React.ReactNode;
  email: string;
  isOpened: boolean;
  language: ValueOf<typeof ProfileLanguage>;
  name: string;
  onClose: () => void;
};

const UserPopover = ({
  children,
  email,
  isOpened,
  language,
  name,
  onClose
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();

  const { chats } = useAppSelector(state => state.chat);

  const handleLogout = useCallback((): void => {
    void dispatch(authActions.logout());

    for (const chat of chats) {
      leaveChatRoom(chat.id);
    }
  }, [chats, dispatch]);

  return (
    <Popover
      content={
        <div className={styles['user-popover']}>
          <div className={styles['user-info']}>
            <p className={styles['user-name']}>{name}</p>
            <p className={styles['user-email']}>{email}</p>
          </div>
          <div className={styles['buttons']}>
            <NavLink
              className={styles['button'] as string}
              to={AppRoute.PROFILE}
            >
              {translate.translate('profile', language)}
            </NavLink>
            <button className={styles['button']} onClick={handleLogout}>
              {translate.translate('logout', language)}
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

export { UserPopover };
