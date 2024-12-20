import logoSrc from '~/assets/images/logo.svg';
import { Image } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useCallback,
  useLocation
} from '~/libs/hooks/hooks.js';
import {
  type UserSignInRequestDto,
  type UserSignUpRequestDto,
  authActions
} from '~/modules/auth/auth.js';

import { SignInForm, SignUpForm } from './components/components.js';
import styles from './styles.module.scss';

const Auth: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();

  const handleSignUpSubmit = useCallback(
    (payload: UserSignUpRequestDto): void => {
      void dispatch(authActions.signUp(payload));
    },
    [dispatch]
  );

  const handleSignInSubmit = useCallback(
    (payload: UserSignInRequestDto): void => {
      void dispatch(authActions.signIn(payload));
    },
    [dispatch]
  );

  const getScreen = (path: string): JSX.Element | null => {
    switch (path) {
      case AppRoute.SIGN_IN: {
        return <SignInForm onSubmit={handleSignInSubmit} />;
      }

      case AppRoute.SIGN_UP: {
        return <SignUpForm onSubmit={handleSignUpSubmit} />;
      }

      default: {
        return null;
      }
    }
  };

  return (
    <div className={styles['login']}>
      <section className={styles['form']}>
        <h2 className={styles['logoWrapper']}>
          <Image
            alt="TeamLink logo"
            height="30"
            isCircular
            src={logoSrc}
            width="40"
          />
          TeamLink
        </h2>
        {getScreen(pathname)}
      </section>
    </div>
  );
};

export { Auth };
