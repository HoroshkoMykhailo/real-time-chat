import React from 'react';

import { ChatPicture } from '~/libs/components/components.js';
import { type Profile } from '~/modules/profile/libs/types/types.js';

import styles from '../../styles.module.scss';

type Properties = {
  user: Profile;
};

const UserItem: React.FC<Properties> = ({
  user: { profilePicture, username }
}) => {
  return (
    <div className={styles['user-item-content']}>
      <ChatPicture name={username} picture={profilePicture} />
      <span className={styles['user-username']}>{username}</span>
    </div>
  );
};

export { UserItem };
