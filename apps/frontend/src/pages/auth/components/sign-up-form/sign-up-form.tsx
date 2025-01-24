import {
  Button,
  IconButton,
  Input,
  NavLink
} from '~/libs/components/components.js';
import { AppRoute, ButtonColor, DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppForm,
  useAppSelector,
  useCallback,
  useEffect,
  useNavigate,
  useState
} from '~/libs/hooks/hooks.js';
import { type UserSignUpRequestDto } from '~/modules/auth/auth.js';
import { signUp as signUpValidationSchema } from '~/modules/auth/libs/validation-schemas/validation-schemas.js';
import { UserPayloadKey } from '~/modules/profile/profile.js';

import { DEFAULT_REGISTRATION_PAYLOAD } from './libs/common/constants.js';
import styles from './styles.module.scss';

type Properties = {
  onSubmit: (payload: UserSignUpRequestDto) => void;
};

const SignUpForm: React.FC<Properties> = ({ onSubmit }) => {
  const { control, errors, handleSubmit, reset } = useAppForm({
    defaultValues: DEFAULT_REGISTRATION_PAYLOAD,
    validationSchema: signUpValidationSchema
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const { dataStatus: authDataStatus, user: authenticatedUser } =
    useAppSelector(state => {
      return state.auth;
    });

  const isLoading = authDataStatus === DataStatus.PENDING;

  const navigate = useNavigate();

  useEffect(() => {
    if (authenticatedUser) {
      navigate(AppRoute.PROFILE);
    }
  }, [authenticatedUser, dispatch, navigate]);

  const handleFormSubmit = (values: UserSignUpRequestDto): void => {
    onSubmit(values);
    reset();
  };

  const handleTogglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(previousState => !previousState);
  }, []);

  return (
    <>
      <h2 className={styles['title']}>Register for free account</h2>
      <form name="registrationForm" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className={styles['fieldset']} disabled={isLoading}>
          <Input
            control={control}
            errors={errors}
            name={UserPayloadKey.USERNAME}
            placeholder="Username"
            type="text"
          />
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
            rightIcon={
              <IconButton
                iconName={isPasswordVisible ? 'strikedEye' : 'eye'}
                label={isPasswordVisible ? 'Hide password' : 'Show password'}
                onClick={handleTogglePasswordVisibility}
              />
            }
            type={isPasswordVisible ? 'text' : 'password'}
          />
          <Input
            control={control}
            errors={errors}
            name={UserPayloadKey.CONFIRM_PASSWORD}
            placeholder="Confirm Password"
            rightIcon={
              <IconButton
                iconName={isPasswordVisible ? 'strikedEye' : 'eye'}
                label={isPasswordVisible ? 'Hide password' : 'Show password'}
                onClick={handleTogglePasswordVisibility}
              />
            }
            type={isPasswordVisible ? 'text' : 'password'}
          />
          <Button
            color={ButtonColor.TEAL}
            isFluid
            isLoading={isLoading}
            isPrimary
            type="submit"
          >
            Sign Up
          </Button>
        </fieldset>
      </form>
      <div className={styles['signInLink']}>
        <span>Already with us?</span>
        <NavLink to={AppRoute.SIGN_IN}>Sign In</NavLink>
      </div>
    </>
  );
};

export { SignUpForm };
