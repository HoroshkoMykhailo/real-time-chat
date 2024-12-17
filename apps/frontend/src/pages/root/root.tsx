import { Navigate } from 'react-router-dom';

import { AppRoute } from '~/libs/enums/enums.js';

const Root: React.FC = () => {
  return <Navigate to={AppRoute.SIGN_IN} />;
};

export { Root };
