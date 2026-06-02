import {
  Button,
  CircularAvatarCropField,
  DatePicker,
  Header,
  Input,
  Select
} from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import { resolveServerMediaUrl } from '~/libs/helpers/helpers.js';
import {
  useAppForm,
  useCallback,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type ValueOf } from '~/libs/types/types.js';
import {
  type Profile,
  ProfileLanguage,
  type UserProfileCreationRequestDto
} from '~/modules/profile/libs/types/types.js';
import { UserPayloadKey } from '~/modules/profile/profile.js';

import styles from './styles.module.scss';

type ProfileFormValues = {
  dateOfBirth?: string;
  description?: string;
  language: ValueOf<typeof ProfileLanguage>;
  profilePicture: File | null;
  username: string;
};

type Properties = {
  ifNewProfile?: boolean;
  onCancel: () => void;
  onUpdate: (data: UserProfileCreationRequestDto) => void;
  profile: Profile;
};

const ProfileEdit: React.FC<Properties> = ({
  ifNewProfile = false,
  onCancel,
  onUpdate,
  profile
}) => {
  const [imageUrl, setImageUrl] = useState<null | string>(null);

  const { control, errors, handleSubmit, reset, setValue } =
    useAppForm<ProfileFormValues>({
      defaultValues: {
        dateOfBirth: profile.dateOfBirth ?? '',
        description: profile.description ?? '',
        language: profile.language,
        profilePicture: null,
        username: profile.username
      }
    });

  useEffect(() => {
    reset({
      dateOfBirth: profile.dateOfBirth ?? '',
      description: profile.description ?? '',
      language: profile.language,
      username: profile.username
    });

    setImageUrl(previous => {
      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }

      return profile.profilePicture
        ? resolveServerMediaUrl(profile.profilePicture)
        : null;
    });
  }, [profile, reset]);

  const handleProfilePictureCropped = useCallback(
    (file: File): void => {
      setValue(UserPayloadKey.PROFILE_PICTURE, file);
      setImageUrl(previous => {
        if (previous?.startsWith('blob:')) {
          URL.revokeObjectURL(previous);
        }

        return URL.createObjectURL(file);
      });
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

    if (values.dateOfBirth && values.dateOfBirth !== profile.dateOfBirth) {
      updateProfile.dateOfBirth = values.dateOfBirth;
    }

    if (values.language !== profile.language) {
      updateProfile.language = values.language;
    }

    onUpdate(updateProfile);
    reset();
  };

  return (
    <>
      <Header />
      <div className={styles['profileForm']}>
        {ifNewProfile ? (
          <h2>{translate.translate('createProfile', profile.language)}</h2>
        ) : (
          <h2>{translate.translate('editProfileLabel', profile.language)}</h2>
        )}
        <form name="profileForm" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className={styles['formWrapper']}>
            <fieldset className={styles['fieldset']}>
              <div className={styles['notImageGroup']}>
                <div className={styles['labelsColumn']}>
                  <label
                    className={styles['label']}
                    htmlFor={UserPayloadKey.USERNAME}
                  >
                    {translate.translate('username', profile.language)}
                  </label>
                  <label
                    className={styles['label']}
                    htmlFor={UserPayloadKey.DESCRIPTION}
                  >
                    {translate.translate('description', profile.language)}
                  </label>
                  <label
                    className={styles['label']}
                    htmlFor={UserPayloadKey.DATE_OF_BIRTH}
                  >
                    {translate.translate('dateOfBirth', profile.language)}
                  </label>
                  <label
                    className={styles['label']}
                    htmlFor={UserPayloadKey.LANGUAGE}
                  >
                    {translate.translate('language', profile.language)}
                  </label>
                </div>
                <div className={styles['inputsColumn']}>
                  <Input
                    control={control}
                    errors={errors}
                    name={UserPayloadKey.USERNAME}
                    placeholder={profile.username}
                    type="text"
                  />
                  <Input
                    control={control}
                    errors={errors}
                    isTextArea
                    name={UserPayloadKey.DESCRIPTION}
                    placeholder={
                      profile.description ??
                      translate.translate('enterDescription', profile.language)
                    }
                    type="text"
                  />
                  <DatePicker
                    control={control}
                    errors={errors}
                    name={UserPayloadKey.DATE_OF_BIRTH}
                    placeholder={translate.translate(
                      'enterDateOfBirth',
                      profile.language
                    )}
                  />
                  <Select
                    control={control}
                    name={UserPayloadKey.LANGUAGE}
                    options={[
                      {
                        label: translate.translate('english', profile.language),
                        value: ProfileLanguage.ENGLISH
                      },
                      {
                        label: translate.translate(
                          'ukrainian',
                          profile.language
                        ),
                        value: ProfileLanguage.UKRAINIAN
                      }
                    ]}
                    placeholder={translate.translate(
                      'selectLanguage',
                      profile.language
                    )}
                  />
                </div>
              </div>
              <div className={styles['imageGroup']}>
                <CircularAvatarCropField
                  applyLabel={translate.translate(
                    'applyCrop',
                    profile.language
                  )}
                  cameraIconClassName={
                    imageUrl
                      ? `${styles['cameraIcon']} ${styles['hasImage']}`
                      : `${styles['cameraIcon']} ${styles['noImage']}`
                  }
                  cancelLabel={translate.translate('cancel', profile.language)}
                  cropTitle={translate.translate(
                    'adjustAvatar',
                    profile.language
                  )}
                  imagePreviewAlt={translate.translate(
                    'profilePhotoPreview',
                    profile.language
                  )}
                  imageUrl={imageUrl}
                  inputId={UserPayloadKey.PROFILE_PICTURE}
                  labelClassName={styles['profilePicture'] ?? ''}
                  onCroppedFile={handleProfilePictureCropped}
                  zoomLabel={translate.translate(
                    'avatarCropZoom',
                    profile.language
                  )}
                />
              </div>
            </fieldset>
            <div className={styles['buttonsContainer']}>
              <Button color={ButtonColor.TEAL} isFluid isPrimary type="submit">
                {translate.translate('saveChanges', profile.language)}
              </Button>
              {!ifNewProfile && (
                <Button
                  color={ButtonColor.GRAY}
                  isFluid
                  onClick={onCancel}
                  type="button"
                >
                  {translate.translate('cancel', profile.language)}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export { ProfileEdit };
