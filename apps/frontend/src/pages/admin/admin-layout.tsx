import { NavLink, RouterOutlet } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import { getValidClassNames } from '~/libs/helpers/helpers.js';
import { useLocation } from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();

  const usersNavClassName = getValidClassNames(
    styles['nav-link'],
    pathname.startsWith(`${AppRoute.ADMIN}/users`) && styles['nav-link-active']
  );

  const monitoringNavClassName = getValidClassNames(
    styles['nav-link'],
    pathname.startsWith(`${AppRoute.ADMIN}/monitoring`) &&
      styles['nav-link-active']
  );

  return (
    <div className={styles['page']}>
      <aside className={styles['sidebar']}>
        <div className={styles['brand']}>Адмін-панель</div>
        <NavLink className={usersNavClassName} to={`${AppRoute.ADMIN}/users`}>
          Користувачі
        </NavLink>
        <NavLink
          className={monitoringNavClassName}
          to={`${AppRoute.ADMIN}/monitoring`}
        >
          Моніторинг
        </NavLink>
        <NavLink className={styles['nav-link'] ?? ''} to={AppRoute.ROOT}>
          Повернутися до чатів
        </NavLink>
      </aside>
      <main className={styles['main']}>
        <RouterOutlet />
      </main>
    </div>
  );
};

export { AdminLayout };
