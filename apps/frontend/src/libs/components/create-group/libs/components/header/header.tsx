import { Button } from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';

import styles from './styles.module.scss';

type Properties = {
  isContinueButtonEnabled?: boolean;
  isGroupInformation?: boolean;
  onContinueClick: () => void;
};

const CreateGroupHeader = ({
  isContinueButtonEnabled = true,
  isGroupInformation = false,
  onContinueClick
}: Properties): JSX.Element => {
  return (
    <div className={styles['create-group-header']}>
      <h2 className={styles['create-group-title']}>
        {isGroupInformation ? 'Group Information' : 'Add Members'}
      </h2>
      {isContinueButtonEnabled && (
        <Button
          className={styles['continue-button'] ?? ''}
          color={ButtonColor.TEAL}
          isPrimary
          onClick={onContinueClick}
        >
          {isGroupInformation ? 'Create' : 'Continue'}
        </Button>
      )}
    </div>
  );
};

export { CreateGroupHeader };
