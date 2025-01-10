import { POPOVER_CLASS, POPOVER_OFFSET } from '~/libs/common/constants.js';
import { Icon, Popover } from '~/libs/components/components.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { chatActions } from '~/modules/chat/chat.js';

import styles from './styles.module.scss';

type Properties = {
  children: React.ReactNode;
  isOpened: boolean;
  memberId: string;
  onClose: () => void;
};

const MemberPopover = ({
  children,
  isOpened,
  memberId,
  onClose
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const popoverReference = useRef<HTMLDivElement | null>(null);
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const [popoverClass, setPopoverClass] = useState<string>(POPOVER_CLASS);

  const handleRemove = useCallback((): void => {
    if (chat) {
      void dispatch(chatActions.removeMember({ id: chat.id, memberId }));
    }
  }, [chat, dispatch, memberId]);

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
            <button className={styles['remove-button']} onClick={handleRemove}>
              <Icon height={24} name="remove" width={24} />
              <span>Remove member</span>
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

export { MemberPopover };
