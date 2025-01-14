import { Button } from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';

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

  const { profile } = useAppSelector(state => state.profile);

  if (!profile) {
    return <></>;
  }

  if (isEditGroup) {
    title = translate.translate('editGroup', profile.language);
    buttonText = translate.translate('edit', profile.language);
  } else if (isGroupInformation) {
    title = translate.translate('groupInformation', profile.language);
    buttonText = translate.translate('create', profile.language);
  } else {
    title = translate.translate('addMembers', profile.language);
    buttonText = translate.translate('continue', profile.language);
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
