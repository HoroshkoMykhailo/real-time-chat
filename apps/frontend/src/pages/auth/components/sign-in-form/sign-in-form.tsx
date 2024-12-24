import { useNavigate } from 'react-router-dom';

import { Button, Input, NavLink } from '~/libs/components/components.js';
import { AppRoute, ButtonColor, DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppForm,
  useAppSelector,
  useEffect
} from '~/libs/hooks/hooks.js';
import { type UserSignInRequestDto } from '~/modules/auth/auth.js';
import { UserPayloadKey } from '~/modules/profile/profile.js';

import { DEFAULT_SIGN_IN_PAYLOAD } from './libs/common/constants.js';
import styles from './styles.module.scss';

type Properties = {
  onSubmit: (payload: UserSignInRequestDto) => void;
};

const SignInForm: React.FC<Properties> = ({ onSubmit }) => {
  const { control, errors, handleSubmit, reset } = useAppForm({
    defaultValues: DEFAULT_SIGN_IN_PAYLOAD
  });

  const dispatch = useAppDispatch();

  const { dataStatus: authDataStatus, user: authenticatedUser } =
    useAppSelector(state => {
      return state.auth;
    });

  const isLoading = authDataStatus === DataStatus.PENDING;

  const navigate = useNavigate();

  useEffect(() => {
    if (authenticatedUser) {
      navigate(AppRoute.ROOT);
    }
  }, [authenticatedUser, dispatch, navigate]);

  const handleFormSubmit = (values: UserSignInRequestDto): void => {
    onSubmit(values);
    reset();
  };

  return (
    <>
      <h2 className={styles['title']}>Login to your account</h2>
      <form name="loginForm" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className={styles['fieldset']} disabled={isLoading}>
          <Input
            control={control}
            errors={errors}
            name={UserPayloadKey.EMAIL}
            placeholder="Email"
            type="email"
          />
          <Input
            control={control}
            errors={errors}
            name={UserPayloadKey.PASSWORD}
            placeholder="Password"
            type="password"
          />
          <Button color={ButtonColor.TEAL} isFluid isPrimary type="submit">
            Sign In
          </Button>
        </fieldset>
      </form>
      <div className={styles['signUpLink']}>
        <span>New to us?</span>
        <NavLink to={AppRoute.SIGN_UP}>Sign Up</NavLink>
      </div>
    </>
  );
};

export { SignInForm };
