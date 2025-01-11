import {
  useHandleClickOutside,
  useHandleMouseLeave,
  useRef
} from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

type Properties = {
  children: React.ReactNode;
  className?: string;
  content: React.ReactNode;
  isOpened: boolean;
  onClose: () => void;
  onMouseLeave?: () => void;
};

const Popover = ({
  children,
  className,
  content,
  isOpened,
  onClose,
  onMouseLeave
}: Properties): JSX.Element => {
  const popoverReference = useRef<HTMLDivElement>(null);
  const popoverTargetReference = useRef<HTMLDivElement>(null);

  useHandleClickOutside(popoverReference, onClose, popoverTargetReference);

  useHandleMouseLeave({ onMouseLeave, reference: popoverReference });

  return (
    <div className={styles['popover-wrapper']} ref={popoverReference}>
      {children}

      {isOpened && (
        <div
          className={styles['popover-content-wrapper']}
          ref={popoverTargetReference}
        >
          <div
            className={`${styles['popover-content']} ${styles[className ?? '']}`}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export { Popover };
