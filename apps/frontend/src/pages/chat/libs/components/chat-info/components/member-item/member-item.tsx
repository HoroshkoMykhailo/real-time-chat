import React from 'react';

import { ChatPicture } from '~/libs/components/components.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type ValueOf } from '~/libs/types/types.js';
import {
  type Profile,
  type ProfileLanguage
} from '~/modules/profile/libs/types/types.js';

import styles from './styles.module.scss';

type Properties = {
  isAdmin?: boolean;
  language: ValueOf<typeof ProfileLanguage>;
  member: Profile;
};

const MemberItem: React.FC<Properties> = ({
  isAdmin = false,
  language,
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
      {isAdmin && (
        <span className={styles['admin-badge']}>
          {translate.translate('admin', language)}
        </span>
      )}
    </div>
  );
};

export { MemberItem };
