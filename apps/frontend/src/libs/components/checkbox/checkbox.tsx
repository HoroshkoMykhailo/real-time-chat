import React from 'react';

import styles from './styles.module.scss';

type Properties = {
  isChecked: boolean;
  isReadOnly?: boolean;
  onChange?: () => void;
};

const Checkbox = ({
  isChecked,
  isReadOnly = false,
  onChange
}: Properties): JSX.Element => {
  return (
    <div className={styles['checkbox-wrapper']}>
      <input
        checked={isChecked}
        className={styles['checkbox']}
        onChange={onChange}
        readOnly={isReadOnly}
        type="checkbox"
      />
      <span className={styles['checkbox-custom']} />
    </div>
  );
};

export { Checkbox };
