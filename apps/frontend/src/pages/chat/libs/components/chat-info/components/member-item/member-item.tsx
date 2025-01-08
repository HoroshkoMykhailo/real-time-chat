import React from 'react';

import { ChatPicture } from '~/libs/components/components.js';
import { type Profile } from '~/modules/profile/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  isAdmin?: boolean;
  member: Profile;
};

const MemberItem: React.FC<Properties> = ({
  isAdmin = false,
  member: { profilePicture, username }
}) => {
  return (
    <div className={styles['member-item-content']}>
      <div className={styles['member-info']}>
        <ChatPicture
          isCircular
          name={username}
          picture={profilePicture}
          size="48"
        />
        <span className={styles['member-username']}>{username}</span>
      </div>
      {isAdmin && <span className={styles['admin-badge']}>Admin</span>}
    </div>
  );
};

export { MemberItem };
