import {
  ChatList,
  Header,
  RouterOutlet
} from '~/libs/components/components.js';
import { useAppDispatch, useEffect } from '~/libs/hooks/hooks.js';
import { profileActions } from '~/modules/profile/profile.js';

import styles from './styles.module.scss';

const Main: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(profileActions.getProfile());
  }, [dispatch]);

  return (
    <div className={styles['page']}>
      <div className={styles['page-header']}>
        <Header />
      </div>
      <div className={styles['page-content']}>
        <ChatList />
        <RouterOutlet />
      </div>
    </div>
  );
};

export { Main };
