import { Loader, Navigate } from '~/libs/components/components.js';
import { AppRoute, DataStatus } from '~/libs/enums/enums.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

type Properties = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: Properties): JSX.Element => {
  const { dataStatus, user: authenticatedUser } = useAppSelector(
    ({ auth }) => auth
  );

  const isLoading =
    dataStatus === DataStatus.PENDING || dataStatus === DataStatus.IDLE;

  if (isLoading) {
    return (
      <div className={styles['loader-container']}>
        <Loader />
      </div>
    );
  }

  if (!authenticatedUser) {
    return <Navigate replace to={AppRoute.SIGN_IN} />;
  }

  return <>{children}</>;
};

export { ProtectedRoute };
