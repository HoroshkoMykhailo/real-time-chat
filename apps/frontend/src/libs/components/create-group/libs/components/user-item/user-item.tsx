import React from 'react';

import { ChatPicture, Checkbox } from '~/libs/components/components.js';
import { type Profile } from '~/modules/profile/libs/types/types.js';

import styles from '../../../styles.module.scss';

type Properties = {
  isSelectable?: boolean;
  isSelected?: boolean;
  user: Profile;
};

const UserItem: React.FC<Properties> = ({
  isSelectable = false,
  isSelected = false,
  user: { profilePicture, username }
}) => {
  return (
    <div className={styles['user-item-content']}>
      <ChatPicture
        isCircular
        name={username}
        picture={profilePicture}
        size="48"
      />
      <span className={styles['user-username']}>{username}</span>
      {isSelectable && (
        <div className={styles['user-checkbox']}>
          <Checkbox isChecked={isSelected} isReadOnly />
        </div>
      )}
    </div>
  );
};

export { UserItem };
