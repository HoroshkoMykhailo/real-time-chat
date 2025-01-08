import { Button } from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import { useAppSelector, useCallback, useState } from '~/libs/hooks/hooks.js';
import { type Profile } from '~/modules/profile/profile.js';

import { MemberItem } from '../member-item/member-item.js';
import { MemberPopover } from '../member-popover/member-popover.js';
import styles from './styles.module.scss';

const MEMBERS_OVERFLOW_COUNT = 3;

type Properties = {
  onOpenAddMembers: () => void;
};

const MembersList = ({ onOpenAddMembers }: Properties): JSX.Element => {
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
      <div className={styles['members-list-header']}>
        <h3 className={styles['members-title']}>Members</h3>
        <Button
          className={styles['add-members-button'] ?? ''}
          color={ButtonColor.TEAL}
          isPrimary
          onClick={onOpenAddMembers}
        >
          Add members
        </Button>
      </div>
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
              <MemberItem
                isAdmin={chat.adminId === member.id}
                member={member}
              />
            </button>
          </MemberPopover>
        ))}
      </div>
    </>
  );
};

export { MembersList };
