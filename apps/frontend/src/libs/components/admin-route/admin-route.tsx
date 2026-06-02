import { Navigate } from 'react-router-dom';

import { AppRoute, UserRole } from '~/libs/enums/enums.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';

type Properties = {
  children: React.ReactNode;
};

const AdminRoute = ({ children }: Properties): JSX.Element => {
  const user = useAppSelector(state => state.auth.user);

  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate replace to={AppRoute.ROOT} />;
  }

  return <>{children}</>;
};

export { AdminRoute };
