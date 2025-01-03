import React from 'react';

import { Icon } from '../components.js';
import styles from './styles.module.scss';

type Properties = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  value: string;
};

const SearchBar: React.FC<Properties> = ({ onChange, placeholder, value }) => {
  return (
    <div className={styles['search-bar']}>
      <div className={styles['search-icon']}>
        <Icon height={24} name="search" width={24} />
      </div>
      <input
        className={styles['search-input']}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </div>
  );
};

export { SearchBar };
