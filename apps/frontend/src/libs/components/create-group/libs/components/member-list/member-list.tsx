import { ONE_VALUE, ZERO_VALUE } from '~/libs/common/constants.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type ValueOf } from '~/libs/types/types.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';
import { type Profile } from '~/modules/profile/profile.js';

import styles from '../../../styles.module.scss';
import { UserItem } from '../user-item/user-item.js';

type Properties = {
  language: ValueOf<typeof ProfileLanguage>;
  selectedUsers: Profile[];
};

const MemberList = ({ language, selectedUsers }: Properties): JSX.Element => (
  <>
    {selectedUsers.length > ZERO_VALUE && (
      <p className={styles['selected-users-count']}>
        <span>{selectedUsers.length}</span>
        <span>
          {selectedUsers.length === ONE_VALUE
            ? translate.translate('member', language)
            : translate.translate('members', language)}
        </span>
      </p>
    )}
    <div className={styles['user-list']}>
      {selectedUsers.map(user => (
        <div className={styles['user-item']} key={user.id}>
          <UserItem user={user} />
        </div>
      ))}
    </div>
  </>
);

export { MemberList };
