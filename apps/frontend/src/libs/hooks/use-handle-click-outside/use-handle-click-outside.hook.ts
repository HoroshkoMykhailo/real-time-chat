import { type RefObject } from 'react';

import { useEffect } from '~/libs/hooks/hooks.js';

type Properties<T extends HTMLElement> = {
  contentReference?: RefObject<null | T>;
  enabled?: boolean;
  onOutsideClick: () => void;
  reference: RefObject<null | T>;
};

const useHandleClickOutside = <T extends HTMLElement>({
  contentReference,
  enabled = true,
  onOutsideClick,
  reference
}: Properties<T>): void => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (!reference.current) {
        return;
      }

      if (reference.current.contains(target)) {
        return;
      }

      if (contentReference?.current?.contains(target)) {
        return;
      }

      onOutsideClick();
    };

    document.addEventListener('click', handleClickOutside);

    return (): void => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contentReference, enabled, onOutsideClick, reference]);
};

export { useHandleClickOutside };
