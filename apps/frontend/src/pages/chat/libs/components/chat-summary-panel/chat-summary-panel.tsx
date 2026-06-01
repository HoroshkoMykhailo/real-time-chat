import { ZERO_VALUE } from '~/libs/common/constants.js';
import { Loader } from '~/libs/components/components.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { chatActions } from '~/modules/chat/chat.js';

import { ChatSummaryMarkdownBody } from './chat-summary-markdown-body.js';
import styles from './styles.module.scss';

type Properties = {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
};

const DATETIME_LOCAL_SLICE_LENGTH = 16;
const HOURS_IN_DEFAULT_RANGE = 24;
const MILLISECONDS_PER_SECOND = 1000;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;

const toLocalInputValue = (date: Date): string => {
  const offsetMilliseconds =
    date.getTimezoneOffset() * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
  const local = new Date(date.getTime() - offsetMilliseconds);

  return local.toISOString().slice(ZERO_VALUE, DATETIME_LOCAL_SLICE_LENGTH);
};

const getMessageFromUnknownError = (error: unknown): null | string => {
  if (error instanceof Error && error.message.length > ZERO_VALUE) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = Reflect.get(error, 'message');

    if (typeof value === 'string' && value.length > ZERO_VALUE) {
      return value;
    }
  }

  return null;
};

const ChatSummaryPanel = ({
  chatId,
  isOpen,
  onClose
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.profile);
  const [endLocal, setEndLocal] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startLocal, setStartLocal] = useState<string>('');
  const [summaryText, setSummaryText] = useState<null | string>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const end = new Date();
    const millisecondsPerHour =
      MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
    const start = new Date(
      end.getTime() - HOURS_IN_DEFAULT_RANGE * millisecondsPerHour
    );

    setEndLocal(toLocalInputValue(end));
    setStartLocal(toLocalInputValue(start));
    setSummaryText(null);
    setErrorMessage(null);
    setIsLoading(false);
  }, [chatId, isOpen]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEndLocal(event.target.value);
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!profile) {
      return;
    }

    const startDate = new Date(startLocal);
    const endDate = new Date(endLocal);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setErrorMessage(
        translate.translate('summaryInvalidDates', profile.language)
      );

      return;
    }

    if (endDate.getTime() < startDate.getTime()) {
      setErrorMessage(
        translate.translate('summaryEndBeforeStart', profile.language)
      );

      return;
    }

    setErrorMessage(null);
    setSummaryText(null);
    setIsLoading(true);

    try {
      const response = await dispatch(
        chatActions.summarizeChat({
          endTime: endDate.toISOString(),
          id: chatId,
          startTime: startDate.toISOString()
        })
      ).unwrap();

      setSummaryText(response.summary);
    } catch (error: unknown) {
      const messageFromPayload = getMessageFromUnknownError(error);

      setErrorMessage(
        messageFromPayload ??
          translate.translate('summaryFailed', profile.language)
      );
    } finally {
      setIsLoading(false);
    }
  }, [chatId, dispatch, endLocal, profile, startLocal]);

  const handleGenerateClick = useCallback(() => {
    void handleGenerate();
  }, [handleGenerate]);

  const handleStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setStartLocal(event.target.value);
    },
    []
  );

  if (!isOpen || !profile) {
    return <></>;
  }

  return (
    <div
      className={styles['backdrop']}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div aria-modal className={styles['panel']} role="dialog">
        <div className={styles['panel-header']}>
          <h2 className={styles['title']}>
            {translate.translate('chatSummary', profile.language)}
          </h2>
          <button className={styles['close']} onClick={onClose} type="button">
            {translate.translate('cancel', profile.language)}
          </button>
        </div>
        <p className={styles['hint']}>
          {translate.translate('summaryTimeRangeHint', profile.language)}
        </p>
        <div className={styles['fields']}>
          <label className={styles['label']}>
            {translate.translate('summaryStart', profile.language)}
            <input
              className={styles['input']}
              onChange={handleStartChange}
              type="datetime-local"
              value={startLocal}
            />
          </label>
          <label className={styles['label']}>
            {translate.translate('summaryEnd', profile.language)}
            <input
              className={styles['input']}
              onChange={handleEndChange}
              type="datetime-local"
              value={endLocal}
            />
          </label>
        </div>
        <div className={styles['actions']}>
          <button
            className={styles['generate']}
            disabled={isLoading}
            onClick={handleGenerateClick}
            type="button"
          >
            {isLoading
              ? translate.translate('summaryGenerating', profile.language)
              : translate.translate('summaryGenerate', profile.language)}
          </button>
        </div>
        {isLoading ? (
          <div className={styles['loader-wrap']}>
            <Loader />
          </div>
        ) : null}
        {errorMessage ? (
          <p className={styles['error']} role="alert">
            {errorMessage}
          </p>
        ) : null}
        {summaryText ? (
          <div className={styles['summary-box']}>
            <h3 className={styles['summary-heading']}>
              {translate.translate('summaryResult', profile.language)}
            </h3>
            <ChatSummaryMarkdownBody text={summaryText} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export { ChatSummaryPanel };
