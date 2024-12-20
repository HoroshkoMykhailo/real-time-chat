import { RouterOutlet } from '~/libs/components/components.js';
import { useAppDispatch, useEffect } from '~/libs/hooks/hooks.js';
import { authActions } from '~/modules/auth/auth.js';

const Root: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(authActions.getAuthenticatedUser());
  }, [dispatch]);

  return <RouterOutlet />;
};

export { Root };
