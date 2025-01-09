import {
  ProtectedRoute,
  RouterProvider
} from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';

import { Auth } from '../auth/auth.js';
import { Chat } from '../chat/chat.js';
import { Main } from '../main/main.js';
import { NotFound } from '../not-found/not-found.js';
import { Profile } from '../profile/profile.js';
import { Root } from '../root/root.js';

const App: React.FC = () => {
  return (
    <RouterProvider
      routes={[
        {
          children: [
            {
              children: [
                {
                  element: <></>,
                  path: AppRoute.ROOT
                },
                {
                  element: <Chat />,
                  path: `${AppRoute.CHATS}${AppRoute.CHAT}`
                }
              ],
              element: (
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              ),
              path: AppRoute.ROOT
            },
            {
              element: (
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              ),
              path: AppRoute.PROFILE
            },
            {
              element: <Auth />,
              path: AppRoute.SIGN_IN
            },
            {
              element: <Auth />,
              path: AppRoute.SIGN_UP
            }
          ],
          element: <Root />,
          path: AppRoute.ROOT
        },
        {
          element: <NotFound />,
          path: AppRoute.ANY
        }
      ]}
    />
  );
};

export { App };
