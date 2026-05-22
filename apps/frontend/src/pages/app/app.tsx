import {
  AdminRoute,
  Navigate,
  ProtectedRoute,
  RouterProvider
} from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';

import { AdminLayout } from '../admin/admin-layout.js';
import { AdminMonitoringChatPage } from '../admin/admin-monitoring-chat-page.js';
import { AdminMonitoringPage } from '../admin/admin-monitoring-page.js';
import { AdminUserDetailPage } from '../admin/admin-user-detail-page.js';
import { AdminUsersPage } from '../admin/admin-users-page.js';
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
                  element: <Navigate replace to="users" />,
                  index: true
                },
                {
                  element: <AdminUsersPage />,
                  path: 'users'
                },
                {
                  element: <AdminUserDetailPage />,
                  path: 'users/:userId'
                },
                {
                  element: <AdminMonitoringPage />,
                  path: 'monitoring'
                },
                {
                  element: <AdminMonitoringChatPage />,
                  path: 'monitoring/:chatId'
                }
              ],
              element: (
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                </ProtectedRoute>
              ),
              path: 'admin'
            },
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
