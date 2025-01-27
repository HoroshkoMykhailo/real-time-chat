import { Button } from '~/libs/components/components.js';
import { AppRoute, ButtonColor } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useNavigate,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { chatActions } from '~/modules/chat/chat.js';
import { messageActions } from '~/modules/messages/message.js';

import { MemberItem } from '../member-item/member-item.js';
import { MemberPopover } from '../member-popover/member-popover.js';
import styles from './styles.module.scss';

type Properties = {
  onOpenAddMembers: () => void;
};

const MembersList = ({ onOpenAddMembers }: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [popoverMemberId, setPopoverMemberId] = useState<null | string>(null);
  const [isOverflow, setIsOverflow] = useState<boolean>(false);
  const membersContainerReference = useRef<HTMLDivElement | null>(null);
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
        memberId !== profile.id &&
        profile.id === chat.adminId
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
    if (membersContainerReference.current) {
      const { clientHeight, scrollHeight } = membersContainerReference.current;
      setIsOverflow(scrollHeight > clientHeight);
    }
  }, [chat?.members]);

  useEffect(() => {
    if (createdChat) {
      void dispatch(messageActions.getMessages({ chatId: createdChat.id }));
      void dispatch(chatActions.getChat({ id: createdChat.id }));

      navigate(`${AppRoute.CHATS}/${createdChat.id}`);
      dispatch(chatActions.setSelectedChat(createdChat));
    }
  }, [navigate, dispatch, createdChat]);

  const handleMemberPopoverClose = useCallback((): void => {
    setPopoverMemberId(null);
  }, []);

  if (!chat || !chat.members || !profile) {
    return <></>;
  }

  const { members } = chat;

  return (
    <>
      <div className={styles['members-list-header']}>
        <h3 className={styles['members-title']}>
          {translate.translate('members', profile.language)}
        </h3>
        <Button
          className={styles['add-members-button'] ?? ''}
          color={ButtonColor.TEAL}
          isPrimary
          onClick={onOpenAddMembers}
        >
          {translate.translate('addMembers', profile.language)}
        </Button>
      </div>
      <div
        className={` ${styles['members-list']} ${isOverflow ? styles['overflow'] : ''}`}
        ref={membersContainerReference}
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
                language={profile.language}
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
