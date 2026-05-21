import { type RefObject } from 'react';

import { useEffect, useRef } from '~/libs/hooks/hooks.js';

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
  const pointerStartedInsideReference = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      pointerStartedInsideReference.current = false;

      return;
    }

    const markPointerSequenceStart = (event: PointerEvent): void => {
      const target = event.target as Node;

      if (!reference.current) {
        pointerStartedInsideReference.current = false;

        return;
      }

      const isInside =
        reference.current.contains(target) ||
        Boolean(contentReference?.current?.contains(target));

      pointerStartedInsideReference.current = isInside;
    };

    const handleClickOutside = (mouseEvent: MouseEvent): void => {
      const startedInside = pointerStartedInsideReference.current;

      pointerStartedInsideReference.current = false;

      const target = mouseEvent.target as Node;

      if (!reference.current) {
        return;
      }

      if (reference.current.contains(target)) {
        return;
      }

      if (contentReference?.current?.contains(target)) {
        return;
      }

      // Same pointer gesture: `click.target` can be detached (DOM swap) or sit under a
      // layer that is not a descendant in the tree react-select uses; `contains` then
      // fails even though the user interacted inside the popover.
      if (startedInside) {
        return;
      }

      onOutsideClick();
    };

    document.addEventListener('pointerdown', markPointerSequenceStart, true);
    document.addEventListener('click', handleClickOutside);

    return (): void => {
      document.removeEventListener(
        'pointerdown',
        markPointerSequenceStart,
        true
      );
      document.removeEventListener('click', handleClickOutside);
      pointerStartedInsideReference.current = false;
    };
  }, [contentReference, enabled, onOutsideClick, reference]);
};

export { useHandleClickOutside };
