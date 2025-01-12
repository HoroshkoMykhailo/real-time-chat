import styles from './styles.module.scss';

type Properties = {
  text: string;
};

const TextMessage = ({ text }: Properties): JSX.Element => {
  return <p className={styles['message-text']}>{text}</p>;
};

export { TextMessage };
