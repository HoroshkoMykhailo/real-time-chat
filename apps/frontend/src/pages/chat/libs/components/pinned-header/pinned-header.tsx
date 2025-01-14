import { ONE_VALUE } from '~/libs/common/constants.js';
import { Icon } from '~/libs/components/components.js';
import { useAppSelector } from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';

import styles from './styles.module.scss';

type Properties = {
  onBackClick: () => void;
};

const PinnedHeader = ({ onBackClick }: Properties): JSX.Element => {
  const { pinnedMessages } = useAppSelector(state => state.message);
  const { profile } = useAppSelector(state => state.profile);

  if (!profile) {
    return <></>;
  }

  const title =
    pinnedMessages.length === ONE_VALUE
      ? translate.translate('pinnedMessage', profile.language)
      : translate.translate('pinnedMessages', profile.language);

  return (
    <div className={styles['pinned-header']}>
      <button className={styles['back-button']} onClick={onBackClick}>
        <Icon height={16} name="arrowLeft" width={16} />
      </button>
      <p className={styles['pinned-header-title']}>
        {pinnedMessages.length} {title}
      </p>
    </div>
  );
};

export { PinnedHeader };
