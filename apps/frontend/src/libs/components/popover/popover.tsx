import clsx from 'clsx';
import { type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import { ZERO_VALUE } from '~/libs/common/constants.js';
import {
  useHandleClickOutside,
  useHandleMouseLeave,
  useLayoutEffect,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

const DEFAULT_PORTAL_GAP_PX = 4;
const EMPTY_RECT = new DOMRect(ZERO_VALUE, ZERO_VALUE, ZERO_VALUE, ZERO_VALUE);
const PORTAL_Z_INDEX = 10_000;

type GetPortalStyleArguments = {
  anchorRect: DOMRect;
  contentRect: DOMRect;
};

type Properties = {
  children: React.ReactNode;
  className?: string;
  content: React.ReactNode;
  getPortalStyle?: (input: GetPortalStyleArguments) => CSSProperties;
  isOpened: boolean;
  onClose: () => void;
  onMouseLeave?: () => void;
  usePortal?: boolean;
};

const Popover = ({
  children,
  className,
  content,
  getPortalStyle,
  isOpened,
  onClose,
  onMouseLeave,
  usePortal = false
}: Properties): JSX.Element => {
  const popoverReference = useRef<HTMLDivElement>(null);
  const popoverTargetReference = useRef<HTMLDivElement>(null);
  const [portalStyles, setPortalStyles] = useState<CSSProperties>({});

  useHandleClickOutside({
    contentReference: popoverTargetReference,
    enabled: isOpened,
    onOutsideClick: onClose,
    reference: popoverReference
  });

  useHandleMouseLeave({
    onMouseLeave,
    reference: usePortal ? popoverTargetReference : popoverReference
  });

  useLayoutEffect(() => {
    if (!isOpened || !usePortal) {
      return;
    }

    const updatePosition = (): void => {
      const anchorElement = popoverReference.current;
      const contentElement = popoverTargetReference.current;

      if (!anchorElement) {
        return;
      }

      const anchorRect = anchorElement.getBoundingClientRect();
      const contentRect = contentElement?.getBoundingClientRect() ?? EMPTY_RECT;

      const customStyles = getPortalStyle
        ? getPortalStyle({ anchorRect, contentRect })
        : {
            left: anchorRect.left,
            top: anchorRect.bottom + DEFAULT_PORTAL_GAP_PX
          };

      setPortalStyles({
        position: 'fixed',
        zIndex: PORTAL_Z_INDEX,
        ...customStyles
      });
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    const resizeObserver = new ResizeObserver(updatePosition);

    if (popoverReference.current) {
      resizeObserver.observe(popoverReference.current);
    }

    if (popoverTargetReference.current) {
      resizeObserver.observe(popoverTargetReference.current);
    }

    return (): void => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      resizeObserver.disconnect();
    };
  }, [getPortalStyle, isOpened, usePortal]);

  const contentClassName = clsx(
    styles['popover-content'],
    usePortal && styles['popover-content--portal'],
    styles[className ?? '']
  );

  const portalNode =
    isOpened &&
    usePortal &&
    createPortal(
      <div
        className={styles['popover-portal-target']}
        ref={popoverTargetReference}
        style={portalStyles}
      >
        <div className={contentClassName}>{content}</div>
      </div>,
      document.body
    );

  return (
    <>
      <div className={styles['popover-wrapper']} ref={popoverReference}>
        {children}

        {isOpened && !usePortal && (
          <div
            className={styles['popover-content-wrapper']}
            ref={popoverTargetReference}
          >
            <div className={contentClassName}>{content}</div>
          </div>
        )}
      </div>
      {portalNode}
    </>
  );
};

export { Popover };
export { type GetPortalStyleArguments };
