import React from 'react';

import { ChatPicture, Checkbox } from '~/libs/components/components.js';
import { type Profile } from '~/modules/profile/libs/types/types.js';

import styles from '../../styles.module.scss';

type Properties = {
  isSelected: boolean;
  user: Profile;
};

const UserItem: React.FC<Properties> = ({
  isSelected,
  user: { profilePicture, username }
}) => {
  return (
    <div className={styles['user-item-content']}>
      <ChatPicture name={username} picture={profilePicture} />
      <span className={styles['user-username']}>{username}</span>
      <div className={styles['user-checkbox']}>
        <Checkbox isChecked={isSelected} isReadOnly />
      </div>
    </div>
  );
};

export { UserItem };
