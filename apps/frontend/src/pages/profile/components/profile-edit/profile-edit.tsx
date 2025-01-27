import {
  Button,
  DatePicker,
  Header,
  Icon,
  Image,
  Input,
  Select
} from '~/libs/components/components.js';
import { ButtonColor, ENV } from '~/libs/enums/enums.js';
import { checkGreaterThanZero } from '~/libs/helpers/check-greater-than-zero.helper.js';
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

    if (profile.profilePicture) {
      setImageUrl(`${ENV.SERVER_URL}${profile.profilePicture}`);
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
                    <div
                      className={`${styles['cameraIcon']} ${styles['noImage']}`}
                    >
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
