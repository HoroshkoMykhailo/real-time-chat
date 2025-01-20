import { ONE_HUNDRED } from '~/libs/common/constants.js';

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
    if (!messagesListReference.current) {
      return;
    }

    messagesListReference.current.scrollTop =
      messagesListReference.current.scrollHeight;
  }, []);

  return { isAtBottom, isAtTop, scrollToBottom };
};

export { useScrollManager };
