import { ONE_VALUE } from '~/libs/common/constants.js';
import { ChatPicture } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useNavigate
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { ChatType, chatActions } from '~/modules/chat/chat.js';

import { ChatInfoHeader } from './components/chat-info-header/chat-info-header.js';
import { MembersList } from './components/members-list/member-list.js';
import styles from './styles.module.scss';

type Properties = {
  isOpen: boolean;
  onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onOpenAddMembers: () => void;
  onOpenGroupEdit: () => void;
};

const ChatInfo = ({
  isOpen,
  onClose,
  onOpenAddMembers,
  onOpenGroupEdit
}: Properties): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);

  const handleDelete = useCallback((): void => {
    if (chat) {
      void dispatch(chatActions.deleteGroup({ id: chat.id }));
      navigate(AppRoute.ROOT);
    }
  }, [chat, dispatch, navigate]);

  if (!chat?.members || !profile) {
    return <></>;
  }

  const isAdmin = chat.adminId === profile.id;

  const chatTypeLabel =
    chat.type === ChatType.GROUP
      ? translate.translate('groupInfo', profile.language)
      : translate.translate('userInfo', profile.language);

  const otherMember =
    chat.type === ChatType.PRIVATE
      ? chat.members.find(member => member.id !== profile.id)
      : null;

  const membersLabel =
    chat.members.length === ONE_VALUE
      ? translate.translate('member', profile.language)
      : translate.translate('members', profile.language);

  return (
    <div className={`${styles['chat-info']} ${isOpen ? styles['open'] : ''}`}>
      <ChatInfoHeader
        chatTypeLabel={chatTypeLabel}
        isAdmin={isAdmin}
        onClose={onClose}
        onDeleteChat={handleDelete}
        onOpenGroupEdit={onOpenGroupEdit}
      />
      <div className={styles['chat-info-content']}>
        <ChatPicture
          height="250"
          name={chat.name}
          picture={chat.chatPicture}
          width="349"
        />
        <div className={styles['chat-name-wrapper']}>
          <h2 className={styles['chat-name']}>{chat.name}</h2>
          {chat.type === ChatType.GROUP && (
            <span className={styles['member-count']}>
              {chat.members.length} {membersLabel}
            </span>
          )}
        </div>
        {otherMember && (
          <div className={styles['detailsContainer']}>
            <div className={styles['labelsColumn']}>
              <span className={styles['detailsLabel']}>
                {translate.translate('username', profile.language)}
              </span>
              {otherMember.description && (
                <span className={styles['detailsLabel']}>
                  {translate.translate('description', profile.language)}
                </span>
              )}
              {otherMember.dateOfBirth && (
                <span className={styles['detailsLabel']}>
                  {translate.translate('dateOfBirth', profile.language)}
                </span>
              )}
              <span className={styles['detailsLabel']}>
                {translate.translate('language', profile.language)}
              </span>
            </div>

            <div className={styles['detailsColumn']}>
              <div className={styles['detailsBox']}>{profile.username}</div>
              {otherMember.description && (
                <div className={styles['detailsBox']}>
                  {profile.description}
                </div>
              )}
              {otherMember.dateOfBirth && (
                <div className={styles['detailsBox']}>
                  {profile.dateOfBirth}
                </div>
              )}
              <div className={styles['detailsBox']}>
                {profile.language === 'en'
                  ? translate.translate('english', profile.language)
                  : translate.translate('ukrainian', profile.language)}
              </div>
            </div>
          </div>
        )}
      </div>
      {chat.type === ChatType.GROUP && (
        <MembersList onOpenAddMembers={onOpenAddMembers} />
      )}
    </div>
  );
};

export { ChatInfo };
