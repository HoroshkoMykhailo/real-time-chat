import { ONE_VALUE, ZERO_VALUE } from '~/libs/common/constants.js';
import { type Profile } from '~/modules/profile/profile.js';

import styles from '../../../styles.module.scss';
import { UserItem } from '../user-item/user-item.js';

type Properties = {
  selectedUsers: Profile[];
};

const MemberList = ({ selectedUsers }: Properties): JSX.Element => (
  <>
    {selectedUsers.length > ZERO_VALUE && (
      <p className={styles['selected-users-count']}>
        {selectedUsers.length} Member
        {selectedUsers.length === ONE_VALUE ? '' : 's'}
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
