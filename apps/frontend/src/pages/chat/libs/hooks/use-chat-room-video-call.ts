import { ZERO_VALUE } from '~/libs/common/constants.js';
import { useCallback, useEffect, useRef } from '~/libs/hooks/hooks.js';
import { emitCallLeave } from '~/libs/modules/socket/socket.js';
import { type AppDispatch, store } from '~/libs/modules/store/store.js';
import { videoCallActions } from '~/modules/video-call/video-call.js';

type Parameters = {
  callParticipantIds: string[];
  chatId: string | undefined;
  dispatch: AppDispatch;
  isGroupChat: boolean;
  localCallChatId: null | string;
  profileId: string | undefined;
};

type Result = {
  handleJoinCallFromBanner: () => void;
  handleLeaveVideoCall: () => void;
  handleOpenVideoCall: () => void;
  isVideoCallOpen: boolean;
  showJoinCallBanner: boolean;
};

const useChatRoomVideoCall = ({
  callParticipantIds,
  chatId,
  dispatch,
  isGroupChat,
  localCallChatId,
  profileId
}: Parameters): Result => {
  const routeChatIdReference = useRef<string | undefined>(undefined);

  const handleOpenVideoCall = useCallback((): void => {
    if (!chatId) {
      return;
    }

    dispatch(videoCallActions.setLocalCallChatId({ chatId }));
  }, [chatId, dispatch]);

  const handleLeaveVideoCall = useCallback((): void => {
    if (chatId) {
      emitCallLeave(chatId);
    }

    dispatch(videoCallActions.setLocalCallChatId({ chatId: null }));
  }, [chatId, dispatch]);

  const handleJoinCallFromBanner = useCallback((): void => {
    handleOpenVideoCall();
  }, [handleOpenVideoCall]);

  useEffect(() => {
    const previousId = routeChatIdReference.current;
    routeChatIdReference.current = chatId;

    if (previousId && chatId !== previousId) {
      const { localCallChatId: activeCallChatId } =
        store.instance.getState().videoCall;

      if (activeCallChatId === previousId) {
        emitCallLeave(previousId);
        store.instance.dispatch(
          videoCallActions.setLocalCallChatId({ chatId: null })
        );
      }
    }
  }, [chatId]);

  const showJoinCallBanner = Boolean(
    profileId &&
    isGroupChat &&
    chatId &&
    callParticipantIds.length > ZERO_VALUE &&
    localCallChatId !== chatId
  );

  const isVideoCallOpen = Boolean(
    chatId && profileId && localCallChatId === chatId
  );

  return {
    handleJoinCallFromBanner,
    handleLeaveVideoCall,
    handleOpenVideoCall,
    isVideoCallOpen,
    showJoinCallBanner
  };
};

export { useChatRoomVideoCall };
