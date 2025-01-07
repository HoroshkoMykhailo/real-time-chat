import { useAppSelector, useCallback, useState } from '~/libs/hooks/hooks.js';
import { type Profile } from '~/modules/profile/profile.js';

import { MemberItem } from '../member-item/member-item.js';
import { MemberPopover } from '../member-popover/member-popover.js';
import styles from './styles.module.scss';

const MEMBERS_OVERFLOW_COUNT = 3;

const MembersList = (): JSX.Element => {
  const [popoverMemberId, setPopoverMemberId] = useState<null | string>(null);
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);

  const handleMemberPopoverClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const memberData = event.currentTarget.dataset['member'];

      if (memberData) {
        const member = JSON.parse(memberData) as Profile;

        if (
          chat &&
          member.id !== chat.adminId &&
          profile &&
          member.id !== profile.id
        ) {
          event.stopPropagation();
          event.preventDefault();
          setPopoverMemberId(member.id);
        }
      }
    },
    [chat, profile]
  );

  const handleMemberPopoverClose = useCallback((): void => {
    setPopoverMemberId(null);
  }, []);

  if (!chat || !chat.members) {
    return <></>;
  }

  const { members } = chat;

  const isOverflow = members.length > MEMBERS_OVERFLOW_COUNT;

  return (
    <>
      <h3 className={styles['members-title']}>Members</h3>
      <div
        className={` ${styles['members-list']} ${isOverflow ? styles['overflow'] : ''}`}
      >
        {members.map(member => (
          <MemberPopover
            isOpened={popoverMemberId === member.id}
            key={member.id}
            memberId={member.id}
            onClose={handleMemberPopoverClose}
          >
            <button
              className={styles['members-item']}
              data-member={JSON.stringify(member)}
              key={member.id}
              onContextMenu={handleMemberPopoverClick}
            >
              <MemberItem member={member} />
            </button>
          </MemberPopover>
        ))}
      </div>
    </>
  );
};

export { MembersList };
