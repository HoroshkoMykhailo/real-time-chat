import { ChatList, Header } from '~/libs/components/components.js';
import {
  useAppDispatch,
  useAppSelector,
  useEffect
} from '~/libs/hooks/hooks.js';
import { profileActions } from '~/modules/profile/profile.js';

import styles from './styles.module.scss';

const Main: React.FC = () => {
  const dispatch = useAppDispatch();

  const { selectedChat } = useAppSelector(state => state.chat);
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
        <h1>{selectedChat?.name}</h1>
      </div>
    </div>
  );
};

export { Main };
