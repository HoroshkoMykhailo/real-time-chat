import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Icon, Image, Input } from '~/libs/components/components.js';
import { AppRoute, ButtonColor } from '~/libs/enums/enums.js';
import { checkGreaterThanZero } from '~/libs/helpers/check-greater-than-zero.helper.js';
import { useAppForm, useCallback, useEffect } from '~/libs/hooks/hooks.js';
import {
  type Profile,
  type UserProfileCreationRequestDto
} from '~/modules/profile/libs/types/types.js';
import { UserPayloadKey } from '~/modules/profile/profile.js';

import styles from './styles.module.scss';

type ProfileFormValues = {
  description?: string;
  profilePicture: File | null;
  username: string;
};

type ProfileEditProperties = {
  ifNewProfile?: boolean;
  onUpdate: (data: UserProfileCreationRequestDto) => void;
  profile: Profile;
};

const ProfileEdit: React.FC<ProfileEditProperties> = ({
  ifNewProfile = false,
  onUpdate,
  profile
}) => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<null | string>(null);

  const { control, errors, handleSubmit, reset, setValue } =
    useAppForm<ProfileFormValues>({
      defaultValues: {
        description: profile.description ?? '',
        profilePicture: null,
        username: profile.username
      }
    });

  useEffect(() => {
    reset({
      description: profile.description ?? '',
      username: profile.username
    });

    if (profile.profilePicture) {
      setImageUrl(
        `${import.meta.env['VITE_APP_PROXY_SERVER_URL']}${profile.profilePicture}`
      );
    }
  }, [profile, reset]);

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (
        event.target.files &&
        checkGreaterThanZero(event.target.files.length)
      ) {
        const [file] = event.target.files;

        if (file) {
          setImageUrl(URL.createObjectURL(file));
          setValue(UserPayloadKey.PROFILE_PICTURE, file);
        }
      }
    },
    [setValue]
  );

  const handleFormSubmit = (values: ProfileFormValues): void => {
    const updateProfile: UserProfileCreationRequestDto = {};

    if (values.profilePicture) {
      updateProfile.profilePicture = values.profilePicture;
    }

    if (values.username !== profile.username) {
      updateProfile.username = values.username;
    }

    if (values.description && values.description !== profile.description) {
      updateProfile.description = values.description;
    }

    onUpdate(updateProfile);
    reset();
    navigate(AppRoute.ROOT);
  };

  return (
    <div className={styles['profileForm']}>
      {ifNewProfile ? (
        <h2>Welcome! Please complete your profile to get started.</h2>
      ) : (
        <h2>Edit your profile details below:</h2>
      )}
      <form name="profileForm" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className={styles['fieldset']}>
          <div className={styles['notImageGroup']}>
            <div className={`${styles['formGroup']} ${styles['username']}`}>
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
            <div className={styles['formGroup']}>
              <label
                className={styles['label']}
                htmlFor={UserPayloadKey.DESCRIPTION}
              >
                Description
              </label>
              <Input
                control={control}
                errors={errors}
                isTextArea
                name={UserPayloadKey.DESCRIPTION}
                placeholder={profile.description ?? 'Please Enter Description'}
                type="text"
              />
            </div>
            <div className={styles['buttonWrapper']}>
              <Button color={ButtonColor.TEAL} isFluid isPrimary type="submit">
                Save Changes
              </Button>
            </div>
          </div>
          <div className={styles['imageGroup']}>
            <label
              className={styles['profilePicture']}
              htmlFor={UserPayloadKey.PROFILE_PICTURE}
            >
              {imageUrl ? (
                <>
                  <Image
                    alt="Selected"
                    height="144"
                    isCircular
                    src={imageUrl}
                    width="144"
                  />
                  <div
                    className={`${styles['cameraIcon']} ${styles['hasImage']}`}
                  >
                    <Icon height={48} name="camera" width={48} />
                  </div>
                </>
              ) : (
                <div className={`${styles['cameraIcon']} ${styles['noImage']}`}>
                  <Icon height={48} name="camera" width={48} />
                </div>
              )}
              <input
                accept="image/*"
                id={UserPayloadKey.PROFILE_PICTURE}
                onChange={handleImageChange}
                style={{ display: 'none' }}
                type="file"
              />
            </label>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export { ProfileEdit };
