import { POPOVER_CLASS, POPOVER_OFFSET } from '~/libs/common/constants.js';
import { Icon, Popover } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useCallback,
  useEffect,
  useNavigate,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';

import styles from './styles.module.scss';

type Properties = {
  chatId: string;
  children: React.ReactNode;
  currentChatId?: string;
  isOpened: boolean;
  onClose: () => void;
};

const ChatPopover = ({
  chatId,
  children,
  currentChatId,
  isOpened,
  onClose
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const popoverReference = useRef<HTMLDivElement | null>(null);
  const [popoverClass, setPopoverClass] = useState<string>(POPOVER_CLASS);

  const handleLeave = useCallback((): void => {
    void dispatch(chatActions.leaveChat({ id: chatId }));

    if (currentChatId === chatId) {
      navigate(AppRoute.ROOT);
    }
  }, [chatId, currentChatId, dispatch, navigate]);

  useEffect(() => {
    if (popoverReference.current) {
      const rect = popoverReference.current.getBoundingClientRect();
      const isNearBottom = rect.bottom > window.innerHeight - POPOVER_OFFSET;

      setPopoverClass(isNearBottom ? 'default-popover-up' : POPOVER_CLASS);
    }
  }, [isOpened]);

  const handleClose = useCallback((): void => {
    onClose();
    setPopoverClass(POPOVER_CLASS);
  }, [onClose]);

  return (
    <Popover
      className={popoverClass}
      content={
        <div className={styles[POPOVER_CLASS]} ref={popoverReference}>
          <div className={styles['buttons']}>
            <button className={styles['leave-button']} onClick={handleLeave}>
              <Icon height={24} name="trashBin" width={24} />
              <span>Leave chat </span>
            </button>
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

export { ChatPopover };
