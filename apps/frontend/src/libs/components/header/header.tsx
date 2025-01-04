import logoSrc from '~/assets/images/logo.svg';
import { Avatar, Image, NavLink } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import { useAppSelector, usePopover } from '~/libs/hooks/hooks.js';

import { UserPopover } from './libs/components/components.js';
import styles from './styles.module.scss';

type Properties = {
  onLogoClick: () => void;
};

const Header = ({ onLogoClick }: Properties): JSX.Element => {
  const {
    isOpened: isUserOpened,
    onClose: onUserClose,
    onOpen: onUserOpen
  } = usePopover();

  const authenticatedUser = useAppSelector(state => state.auth.user);

  const profile = useAppSelector(state => state.profile.profile);

  if (!authenticatedUser || !profile) {
    return <></>;
  }

  const { email } = authenticatedUser;

  const { profilePicture, username } = profile;

  return (
    <header className={styles['header']}>
      <NavLink
        className={styles['logo-link'] as string}
        onClick={onLogoClick}
        to={AppRoute.ROOT}
      >
        <Image
          alt="TeamLink logo"
          height="30"
          isCircular
          src={logoSrc}
          width="40"
        />
      </NavLink>
      <div className={styles['header-popovers']}>
        <UserPopover
          email={email}
          isOpened={isUserOpened}
          name={username}
          onClose={onUserClose}
        >
          <button
            className={styles['user-popover-trigger']}
            onClick={isUserOpened ? onUserClose : onUserOpen}
          >
            <Avatar name={username} picture={profilePicture} />
          </button>
        </UserPopover>
      </div>
    </header>
  );
};

export { Header };
