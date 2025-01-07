import { type Profile } from '~/modules/profile/profile.js';

import { MemberItem } from '../member-item/member-item.js';
import styles from './styles.module.scss';

type Properties = {
  members: Profile[];
};

const MembersList = ({ members }: Properties): JSX.Element => (
  <>
    <h3 className={styles['members-title']}>Members</h3>
    <div className={styles['members-list']}>
      {members.map(member => (
        <div className={styles['members-item']} key={member.id}>
          <MemberItem member={member} />
        </div>
      ))}
    </div>
  </>
);

export { MembersList };
