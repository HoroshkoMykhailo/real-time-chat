import styles from './styles.module.scss';

type Properties = {
  buttonLabel: string;
  headline: string;
  onJoin: () => void;
  participantCount: number;
  subline: string;
};

const JoinCallBanner = ({
  buttonLabel,
  headline,
  onJoin,
  participantCount,
  subline
}: Properties): JSX.Element => {
  return (
    <div className={styles['banner']} role="status">
      <div className={styles['text']}>
        <strong className={styles['title']}>{headline}</strong>
        <span className={styles['meta']}>
          {participantCount} {subline}
        </span>
      </div>
      <button className={styles['join']} onClick={onJoin} type="button">
        {buttonLabel}
      </button>
    </div>
  );
};

export { JoinCallBanner };
