import React from 'react';

import { ChatPicture } from '~/libs/components/components.js';
import { type Profile } from '~/modules/profile/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  member: Profile;
};

const MemberItem: React.FC<Properties> = ({
  member: { profilePicture, username }
}) => {
  return (
    <div className={styles['member-item-content']}>
      <ChatPicture
        isCircular
        name={username}
        picture={profilePicture}
        size="48"
      />
      <span className={styles['member-username']}>{username}</span>
    </div>
  );
};

export { MemberItem };
