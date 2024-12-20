import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Icon,
  Input,
  Loader,
  Navigate
} from '~/libs/components/components.js';
import { AppRoute, ButtonColor, DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppForm,
  useAppSelector
} from '~/libs/hooks/hooks.js';
import { type UserProfileCreationRequestDto } from '~/modules/profile/libs/types/types.js';
import { UserPayloadKey, profileActions } from '~/modules/profile/profile.js';

import styles from './styles.module.scss';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    void dispatch(profileActions.getProfile());
  }, [dispatch]);

  const { dataStatus: profileDataStatus, profile } = useAppSelector(state => {
    return state.profile;
  });

  const isLoading = profileDataStatus === DataStatus.PENDING;
  const isRejected = profileDataStatus === DataStatus.REJECTED;

  const { control, errors, handleSubmit, reset } = useAppForm({
    defaultValues: {
      username: profile?.username ?? ''
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username
      });
    }
  }, [profile, reset]);

  if (isLoading || !profile) {
    return <Loader />;
  } else if (isRejected) {
    return <Navigate replace to={AppRoute.SIGN_IN} />;
  }

  const handleFormSubmit = (values: UserProfileCreationRequestDto): void => {
    void dispatch(profileActions.updateProfile(values));
    reset();
    navigate(AppRoute.ROOT);
  };

  const ifNewProfile = profile.createdAt === profile.updatedAt;

  return (
    <div className={styles['profileForm']}>
      {ifNewProfile ? (
        <h2>Welcome! Please complete your profile to get started.</h2>
      ) : (
        <h2>Edit your profile details below:</h2>
      )}
      <form name="profileForm" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className={styles['fieldset']} disabled={isLoading}>
          <div className={styles['notImageGroup']}>
            <div className={styles['formGroup']}>
              <label
                className={styles['label']}
                htmlFor={UserPayloadKey.USERNAME}
              >
                Username
              </label>
              <Input
                control={control}
                errors={errors}
                name={UserPayloadKey.USERNAME}
                placeholder={profile.username}
                type="text"
              />
            </div>
            <div className={styles['buttonWrapper']}>
              <Button color={ButtonColor.TEAL} isFluid isPrimary type="submit">
                Save Changes
              </Button>
            </div>
          </div>
          <div className={styles['icon']}>
            <Icon height={48} name="error" width={48} />
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export { Profile };
