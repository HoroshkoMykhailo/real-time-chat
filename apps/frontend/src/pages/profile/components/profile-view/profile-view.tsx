import { Button, Header, Icon, Image } from '~/libs/components/components.js';
import { ButtonColor, ENV } from '~/libs/enums/enums.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type Profile } from '~/modules/profile/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  onBack: () => void;
  onEdit: () => void;
  profile: Profile;
};

const ProfileView: React.FC<Properties> = ({ onBack, onEdit, profile }) => {
  const imageUrl = profile.profilePicture
    ? `${ENV.SERVER_URL}${profile.profilePicture}`
    : null;

  return (
    <>
      <Header />
      <div className={styles['profileView']}>
        <h2>{translate.translate('profileDetails', profile.language)}</h2>
        <div className={styles['profileContent']}>
          <div className={styles['detailsContainer']}>
            <div className={styles['labelsColumn']}>
              <span className={styles['detailsLabel']}>
                {translate.translate('username', profile.language)}
              </span>
              {profile.description && (
                <span className={styles['detailsLabel']}>
                  {translate.translate('description', profile.language)}
                </span>
              )}
              {profile.dateOfBirth && (
                <span className={styles['detailsLabel']}>
                  {translate.translate('dateOfBirth', profile.language)}
                </span>
              )}
              <span className={styles['detailsLabel']}>
                {translate.translate('language', profile.language)}
              </span>
            </div>

            <div className={styles['detailsColumn']}>
              <div className={styles['detailsBox']}>{profile.username}</div>
              {profile.description && (
                <div className={styles['detailsBox']}>
                  {profile.description}
                </div>
              )}
              {profile.dateOfBirth && (
                <div className={styles['detailsBox']}>
                  {profile.dateOfBirth}
                </div>
              )}
              <div className={styles['detailsBox']}>
                {profile.language === 'en'
                  ? translate.translate('english', profile.language)
                  : translate.translate('ukrainian', profile.language)}
              </div>
            </div>
          </div>
          <div className={styles['imageContainer']}>
            <div className={styles['profileImage']}>
              {imageUrl ? (
                <Image
                  alt="Profile"
                  height="144"
                  isCircular
                  src={imageUrl}
                  width="144"
                />
              ) : (
                <div className={`${styles['cameraIcon']} ${styles['noImage']}`}>
                  <Icon height={48} name="camera" width={48} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles['buttonsContainer']}>
          <Button
            color={ButtonColor.TEAL}
            isFluid
            isPrimary
            onClick={onEdit}
            type="button"
          >
            {translate.translate('editProfile', profile.language)}
          </Button>
          <Button
            color={ButtonColor.GRAY}
            isFluid
            onClick={onBack}
            type="button"
          >
            {translate.translate('backToHome', profile.language)}
          </Button>
        </div>
      </div>
    </>
  );
};

export { ProfileView };
