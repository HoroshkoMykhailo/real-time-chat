import { Loader, NavLink } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import { useEffect, useState } from '~/libs/hooks/hooks.js';
import { toastNotifier } from '~/libs/modules/toast-notifier/toast-notifier.js';
import { adminApi, type AdminUserSummary } from '~/modules/admin/admin.js';

import styles from './styles.module.scss';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const payload = await adminApi.listUsers();

        if (!cancelled) {
          setUsers(payload);
        }
      } catch {
        if (!cancelled) {
          setError(
            'Не вдалося завантажити список користувачів. Спробуйте пізніше.'
          );
          toastNotifier.showError(
            'Не вдалося завантажити список користувачів.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return (): void => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className={styles['title']}>Користувачі</h1>
      {error ? <p className={styles['error']}>{error}</p> : null}
      <div className={styles['table-wrap']}>
        <table className={styles['table']}>
          <thead>
            <tr>
              <th className={styles['th']}>Ім&apos;я</th>
              <th className={styles['th']}>Електронна пошта</th>
              <th className={styles['th']}>Роль</th>
              <th className={styles['th']}>Створено</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className={styles['td']}>
                  <NavLink
                    className={styles['row-link'] as string}
                    to={`${AppRoute.ADMIN}/users/${user.id}`}
                  >
                    {user.username}
                  </NavLink>
                </td>
                <td className={styles['td']}>{user.email}</td>
                <td className={styles['td']}>{user.role}</td>
                <td className={styles['td']}>
                  {new Date(user.createdAt).toLocaleString('uk-UA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { AdminUsersPage };
