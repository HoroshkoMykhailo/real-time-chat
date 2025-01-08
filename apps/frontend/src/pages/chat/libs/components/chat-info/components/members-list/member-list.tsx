import { Button } from '~/libs/components/components.js';
import { AppRoute, ButtonColor } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useNavigate,
  useState
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';

import { MemberItem } from '../member-item/member-item.js';
import { MemberPopover } from '../member-popover/member-popover.js';
import styles from './styles.module.scss';

const MEMBERS_OVERFLOW_COUNT = 3;

type Properties = {
  onOpenAddMembers: () => void;
};

const MembersList = ({ onOpenAddMembers }: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [popoverMemberId, setPopoverMemberId] = useState<null | string>(null);
  const { createdChat, selectedChat: chat } = useAppSelector(
    state => state.chat
  );
  const { profile } = useAppSelector(state => state.profile);

  const handleMemberPopoverClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { memberId } = event.currentTarget.dataset;

      if (
        memberId &&
        chat &&
        memberId !== chat.adminId &&
        profile &&
        memberId !== profile.id
      ) {
        event.stopPropagation();
        event.preventDefault();
        setPopoverMemberId(memberId);
      }
    },
    [chat, profile]
  );

  const handleUserClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      const { memberId } = event.currentTarget.dataset;

      if (memberId && profile && memberId !== profile.id) {
        void dispatch(
          chatActions.createPrivateChat({
            otherId: memberId,
            userId: profile.id
          })
        );
      }
    },
    [profile, dispatch]
  );

  useEffect(() => {
    if (createdChat) {
      dispatch(chatActions.setSelectedChat(createdChat));
      navigate(`${AppRoute.CHATS}/${createdChat.id}`);
    }
  }, [navigate, dispatch, createdChat]);

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
              data-member-id={member.id}
              onClick={handleUserClick}
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
