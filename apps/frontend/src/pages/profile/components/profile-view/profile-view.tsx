import { Button, Header, Icon, Image } from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import { type Profile } from '~/modules/profile/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  onBack: () => void;
  onEdit: () => void;
  profile: Profile;
};

const ProfileView: React.FC<Properties> = ({ onBack, onEdit, profile }) => {
  const imageUrl = profile.profilePicture
    ? `${import.meta.env['VITE_APP_PROXY_SERVER_URL']}${profile.profilePicture}`
    : null;

  return (
    <>
      <Header />
      <div className={styles['profileView']}>
        <h2>Profile Details</h2>
        <div className={styles['profileContent']}>
          <div className={styles['detailsContainer']}>
            <div className={styles['detailsGroup']}>
              <span className={styles['detailsLabel']}>Username</span>
              <div className={styles['detailsWrapper']}>
                <div className={styles['detailsBox']}>{profile.username}</div>
              </div>
            </div>
            {profile.description && (
              <div className={styles['detailsGroup']}>
                <span className={styles['detailsLabel']}>Description</span>
                <div className={styles['detailsWrapper']}>
                  <div className={styles['detailsBox']}>
                    {profile.description}
                  </div>
                </div>
              </div>
            )}
            {profile.dateOfBirth && (
              <div className={styles['detailsGroup']}>
                <span className={styles['detailsLabel']}>Date of Birth</span>
                <div className={styles['detailsWrapper']}>
                  <div className={styles['detailsBox']}>
                    {profile.dateOfBirth}
                  </div>
                </div>
              </div>
            )}
            <div className={styles['detailsGroup']}>
              <span className={styles['detailsLabel']}>Language</span>
              <div className={styles['detailsWrapper']}>
                <div className={styles['detailsBox']}>
                  {profile.language === 'en' ? 'English' : 'Ukrainian'}
                </div>
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
            Edit Profile
          </Button>
          <Button
            color={ButtonColor.GRAY}
            isFluid
            onClick={onBack}
            type="button"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </>
  );
};

export { ProfileView };
