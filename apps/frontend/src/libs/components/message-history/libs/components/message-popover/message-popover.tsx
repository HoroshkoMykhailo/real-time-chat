import { Icon, Popover } from '~/libs/components/components.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { MessageType, messageActions } from '~/modules/messages/message.js';

import styles from './styles.module.scss';

const POPOVER_CLASS = 'message-popover';
const POPOVER_OFFSET = 100;

type Properties = {
  children: React.ReactNode;
  isOpened: boolean;
  messageId: string;
  onClose: () => void;
};

const MessagePopover = ({
  children,
  isOpened,
  messageId,
  onClose
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const popoverReference = useRef<HTMLDivElement | null>(null);
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);
  const { messages } = useAppSelector(state => state.message);
  const [popoverClass, setPopoverClass] = useState<string>(POPOVER_CLASS);

  const message = messages.find(message => message.id === messageId);

  const handleDeleteClick = useCallback((): void => {
    if (message) {
      void dispatch(messageActions.deleteMessage({ messageId: message.id }));
    }
  }, [dispatch, message]);

  useEffect(() => {
    if (popoverReference.current) {
      const rect = popoverReference.current.getBoundingClientRect();
      const isNearBottom = rect.bottom > window.innerHeight - POPOVER_OFFSET;

      setPopoverClass(isNearBottom ? 'message-popover-up' : POPOVER_CLASS);
    }
  }, [isOpened]);

  const handleClose = useCallback((): void => {
    onClose();
    setPopoverClass(POPOVER_CLASS);
  }, [onClose]);

  if (!message) {
    return <></>;
  }

  return (
    <Popover
      className={popoverClass}
      content={
        <div className={styles[POPOVER_CLASS]} ref={popoverReference}>
          <div className={styles['buttons']}>
            <button className={styles['pin-button']}>
              <Icon height={24} name="pin" width={24} />
              <span>Pin</span>
            </button>
            {message.type === MessageType.TEXT && (
              <button className={styles['copy-button']}>
                <Icon height={24} name="copy" width={24} />
                <span>Copy text</span>
              </button>
            )}
            {profile?.id === message.sender.id && (
              <button className={styles['edit-button']}>
                <Icon height={24} name="pencil" width={24} />
                <span>Edit</span>
              </button>
            )}
            {(profile?.id === message.sender.id ||
              profile?.id === chat?.adminId) && (
              <button
                className={styles['delete-button']}
                onClick={handleDeleteClick}
              >
                <Icon height={24} name="trashBin" width={24} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      }
      isOpened={isOpened}
      onClose={handleClose}
    >
      {children}
    </Popover>
  );
};

export { MessagePopover };
