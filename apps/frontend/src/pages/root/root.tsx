import { ZERO_VALUE } from '~/libs/common/constants.js';
import { RouterOutlet } from '~/libs/components/components.js';
import { DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useEffect
} from '~/libs/hooks/hooks.js';
import {
  initializeSocketListeners,
  leaveChatRoom,
  registerSocketUserSession,
  socket
} from '~/libs/modules/socket/socket.js';
import { store } from '~/libs/modules/store/store.js';
import { authActions } from '~/modules/auth/auth.js';

const Root: React.FC = () => {
  const dispatch = useAppDispatch();

  const { chats } = useAppSelector(state => state.chat);
  const { dataStatus: authDataStatus, user: authUser } = useAppSelector(
    state => state.auth
  );

  useEffect(() => {
    void dispatch(authActions.getAuthenticatedUser());
    initializeSocketListeners(dispatch, () => store.instance.getState());
    registerSocketUserSession();

    const handleSocketConnect = (): void => {
      registerSocketUserSession();
    };

    socket.on('connect', handleSocketConnect);

    return (): void => {
      socket.off('connect', handleSocketConnect);
    };
  }, [dispatch]);

  useEffect(() => {
    if (authUser && authDataStatus === DataStatus.FULFILLED) {
      registerSocketUserSession();
    }
  }, [authUser, authDataStatus]);

  useEffect(() => {
    if (authDataStatus === DataStatus.REJECTED && chats.length !== ZERO_VALUE) {
      for (const chat of chats) {
        leaveChatRoom(chat.id);
      }
    }
  }, [authDataStatus, chats, chats.length, dispatch]);

  return <RouterOutlet />;
};

export { Root };
