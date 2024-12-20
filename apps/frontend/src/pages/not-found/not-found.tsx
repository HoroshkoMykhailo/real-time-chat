import React from 'react';

import { Button, Icon } from '~/libs/components/components.js';
import { AppRoute, ButtonColor } from '~/libs/enums/enums.js';

import styles from './styles.module.scss';

const NotFound: React.FC = () => {
  return (
    <div className={styles['container']}>
      <div className={styles['content']}>
        <div className={styles['icon']}>
          <Icon height={48} name="error" width={48} />
        </div>
        <h1 className={styles['title']}>404 Not Found</h1>
        <p className={styles['message']}>
          Oops! The page you are looking for doesn’t exist or has been moved.
        </p>
        <div className={styles['buttonWrapper']}>
          <Button
            color={ButtonColor.TEAL}
            href={AppRoute.ROOT}
            isFluid
            isPrimary
          >
            Go Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export { NotFound };
