import { Button } from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';

import styles from './styles.module.scss';

type Properties = {
  isContinueButtonEnabled?: boolean;
  isEditGroup?: boolean;
  isGroupInformation?: boolean;
  onContinueClick: () => void;
};

const CreateGroupHeader = ({
  isContinueButtonEnabled = true,
  isEditGroup = false,
  isGroupInformation = false,
  onContinueClick
}: Properties): JSX.Element => {
  let title: string;
  let buttonText: string;

  if (isEditGroup) {
    title = 'Edit Group';
    buttonText = 'Edit';
  } else if (isGroupInformation) {
    title = 'Group Information';
    buttonText = 'Create';
  } else {
    title = 'Add Members';
    buttonText = 'Continue';
  }

  return (
    <div className={styles['create-group-header']}>
      <h2 className={styles['create-group-title']}>{title}</h2>
      {isContinueButtonEnabled && (
        <Button
          className={styles['continue-button'] ?? ''}
          color={ButtonColor.TEAL}
          isPrimary
          onClick={onContinueClick}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export { CreateGroupHeader };
