import { ONE_HUNDRED, TWO_VALUE } from '~/libs/common/constants.js';

import { useCallback } from '../hooks.js';

type UseScrollManager = {
  isAtBottom: () => boolean;
  isAtTop: () => boolean;
  scrollToBottom: () => void;
};

const useScrollManager = (
  messagesListReference: React.RefObject<HTMLDivElement>
): UseScrollManager => {
  const isAtTop = useCallback(() => {
    if (!messagesListReference.current) {
      return false;
    }

    return messagesListReference.current.scrollTop <= ONE_HUNDRED;
  }, []);

  const isAtBottom = useCallback(() => {
    if (!messagesListReference.current) {
      return false;
    }

    const { clientHeight, scrollHeight, scrollTop } =
      messagesListReference.current;

    return scrollTop + clientHeight >= scrollHeight - ONE_HUNDRED;
  }, []);

  const scrollToBottom = useCallback(() => {
    const reference = messagesListReference.current;

    if (!reference) {
      return;
    }

    setTimeout(() => {
      reference.scrollTop = reference.scrollHeight;
    }, TWO_VALUE);
  }, []);

  return { isAtBottom, isAtTop, scrollToBottom };
};

export { useScrollManager };
