import { type RefObject, useEffect, useRef } from 'react';

const DEFAULT_DELAY = 500;

type Properties = {
  delay?: number;
  onMouseLeave: (() => void) | undefined;
  reference: RefObject<HTMLElement | null>;
};

const useHandleMouseLeave = ({
  delay = DEFAULT_DELAY,
  onMouseLeave,
  reference
}: Properties): void => {
  const timeoutReference = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!onMouseLeave) {
      return;
    }

    const clearCurrentTimeout = (): void => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
        timeoutReference.current = null;
      }
    };

    const handleMouseLeave = (event: MouseEvent): void => {
      const relatedTarget = event.relatedTarget as Node | null;
      const currentTarget = event.currentTarget as Node;

      if (relatedTarget !== null && !currentTarget.contains(relatedTarget)) {
        timeoutReference.current = setTimeout(() => {
          onMouseLeave();
        }, delay);
      }
    };

    const handleMouseEnter = (): void => {
      clearCurrentTimeout();
    };

    const element = reference.current;

    if (element) {
      element.addEventListener('mouseout', handleMouseLeave);
      element.addEventListener('mouseover', handleMouseEnter);

      return (): void => {
        element.removeEventListener('mouseout', handleMouseLeave);
        element.removeEventListener('mouseover', handleMouseEnter);
        clearCurrentTimeout();
      };
    }
  }, [reference, onMouseLeave, delay]);
};

export { useHandleMouseLeave };
