import { AppRoute, StorageKey } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useEffect,
  useNavigate,
  useRef
} from '~/libs/hooks/hooks.js';
import { authActions } from '~/modules/auth/auth.js';
import { storageApi } from '~/modules/storage/storage.js';

const GoogleOAuthCallbackPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const hasHandledReference = useRef(false);

  useEffect(() => {
    if (hasHandledReference.current) {
      return;
    }

    hasHandledReference.current = true;

    const hash = globalThis.location.hash.replace(/^#/, '');
    const parameters = new URLSearchParams(hash);
    const token = parameters.get('token');
    const isNewGoogleUser = parameters.get('oauthNewUser') === '1';

    if (token) {
      storageApi.set(StorageKey.TOKEN, token);
      globalThis.history.replaceState(
        null,
        '',
        globalThis.location.pathname + globalThis.location.search
      );
      void dispatch(authActions.getAuthenticatedUser()).then(() => {
        void navigate(isNewGoogleUser ? AppRoute.PROFILE : AppRoute.ROOT, {
          replace: true
        });
      });
    } else {
      void navigate(
        `${AppRoute.SIGN_IN}?oauthError=${encodeURIComponent('missing_token')}`,
        { replace: true }
      );
    }
  }, [dispatch, navigate]);

  return <p>Signing you in…</p>;
};

export { GoogleOAuthCallbackPage };
