import styles from './styles.module.scss';

const Loader = (): JSX.Element => (
  <div className={styles['loader-wrapper']}>
    <output aria-label="Loading" className={styles['loader']} />
  </div>
);

export { Loader };
