import { Button } from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';

import styles from './styles.module.scss';

type Properties = {
  isGroupInformation: boolean;
  onContinueClick: () => void;
};

const CreateGroupHeader = ({
  isGroupInformation,
  onContinueClick
}: Properties): JSX.Element => {
  return (
    <div className={styles['create-group-header']}>
      <h2 className={styles['create-group-title']}>
        {isGroupInformation ? 'Group Information' : 'Add Members'}
      </h2>
      <Button
        className={styles['continue-button'] ?? ''}
        color={ButtonColor.TEAL}
        isPrimary
        onClick={onContinueClick}
      >
        Continue
      </Button>
    </div>
  );
};

export { CreateGroupHeader };
