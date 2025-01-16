import { MINUS_ONE_VALUE } from '~/libs/common/constants.js';
import { Icon, Popover } from '~/libs/components/components.js';
import { DataStatus, NotificationMessage } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { toastNotifier } from '~/libs/modules/toast-notifier/toast-notifier.js';
import { type ValueOf } from '~/libs/types/types.js';
import { chatActions } from '~/modules/chat/chat.js';
import {
  type MessageLanguage,
  MessageType,
  messageActions
} from '~/modules/messages/message.js';

import { LanguageSelector } from './components/language-selector/language-selector.js';
import styles from './styles.module.scss';

const POPOVER_CLASS = 'message-popover';
const POPOVER_OFFSET = 80;

type Properties = {
  children: React.ReactNode;
  isOpened: boolean;
  messageId: string;
  onClose: () => void;
  setEditingMessageId?: (messageId: null | string) => void;
};

const MessagePopover = ({
  children,
  isOpened,
  messageId,
  onClose,
  setEditingMessageId
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const popoverReference = useRef<HTMLDivElement | null>(null);
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);
  const { editDataStatus, messages, pinnedMessages } = useAppSelector(
    state => state.message
  );
  const [popoverClass, setPopoverClass] = useState<string>(POPOVER_CLASS);
  const [isLanguageSelectorOpened, setIsLanguageSelectorOpened] =
    useState<boolean>(false);

  const message = messages.find(message => message.id === messageId);

  const handleClose = useCallback((): void => {
    onClose();
    setIsLanguageSelectorOpened(false);
    setPopoverClass(POPOVER_CLASS);
  }, [onClose]);

  const handleDeleteClick = useCallback((): void => {
    if (message) {
      void dispatch(messageActions.deleteMessage({ messageId: message.id }));
    }
  }, [dispatch, message]);

  const handleTranslateClick = useCallback((): void => {
    if (message) {
      setIsLanguageSelectorOpened(true);
    }
  }, [message]);

  const handleLanguageSelect = useCallback(
    (languageCode: ValueOf<typeof MessageLanguage>): void => {
      if (message) {
        void dispatch(
          messageActions.translateMessage({
            language: languageCode,
            messageId: message.id
          })
        );
        handleClose();
      }
    },
    [dispatch, handleClose, message]
  );

  const handleCopyClick = useCallback((): void => {
    if (message) {
      message.translatedMessage
        ? void navigator.clipboard.writeText(message.translatedMessage)
        : void navigator.clipboard.writeText(message.content);
      toastNotifier.showSuccess(NotificationMessage.MESSAGE_COPIED);
      handleClose();
    }
  }, [handleClose, message]);

  const handlePinClick = useCallback((): void => {
    if (message) {
      void dispatch(
        messageActions.updatePinMessage({
          messageId: message.id
        })
      );

      handleClose();
    }
  }, [dispatch, handleClose, message]);

  const handleOriginalClick = useCallback((): void => {
    if (message) {
      void dispatch(
        messageActions.toOriginalMessage({
          messageId: message.id
        })
      );
      handleClose();
    }
  }, [dispatch, handleClose, message]);

  const handleTranscribeClick = useCallback((): void => {
    if (message) {
      void dispatch(
        messageActions.transcribeMessage({
          messageId: message.id
        })
      );
      handleClose();
    }
  }, [dispatch, handleClose, message]);

  const handleEditClick = useCallback((): void => {
    if (message && message.type === MessageType.TEXT && setEditingMessageId) {
      setEditingMessageId(message.id);
      handleClose();
    }
  }, [handleClose, message, setEditingMessageId]);

  useEffect(() => {
    if (popoverReference.current) {
      const rect = popoverReference.current.getBoundingClientRect();
      const isNearBottom = rect.bottom > window.innerHeight - POPOVER_OFFSET;

      setPopoverClass(isNearBottom ? 'message-popover-up' : POPOVER_CLASS);
    }
  }, [isOpened]);

  useEffect(() => {
    if (editDataStatus === DataStatus.FULFILLED) {
      const lastPinnedMessage = pinnedMessages.at(MINUS_ONE_VALUE);

      if (lastPinnedMessage) {
        dispatch(
          chatActions.updateLastPinnedMessage({
            message: {
              ...lastPinnedMessage,
              senderName: lastPinnedMessage.sender.username
            }
          })
        );
      } else {
        dispatch(chatActions.resetLastPinnedMessage());
      }
    }
  }, [dispatch, editDataStatus, pinnedMessages]);

  if (!message || !chat || !profile) {
    return <></>;
  }

  return (
    <Popover
      className={popoverClass}
      content={
        <div className={styles[POPOVER_CLASS]} ref={popoverReference}>
          <div className={styles['buttons']}>
            <button className={styles['pin-button']} onClick={handlePinClick}>
              {message.isPinned ? (
                <>
                  <Icon height={24} name="unPin" width={24} />
                  <span>{translate.translate('unPin', profile.language)}</span>
                </>
              ) : (
                <>
                  <Icon height={24} name="pin" width={24} />
                  <span>{translate.translate('pin', profile.language)}</span>
                </>
              )}
            </button>
            {message.type === MessageType.AUDIO && !message.content && (
              <button
                className={styles['transcribe-button']}
                onClick={handleTranscribeClick}
              >
                <Icon height={24} name="transcribe" width={24} />
                <span>
                  {translate.translate('transcribe', profile.language)}
                </span>
              </button>
            )}
            {((message.type === MessageType.AUDIO && message.content) ||
              message.type === MessageType.TEXT) && (
              <>
                {message.translatedMessage && (
                  <button
                    className={styles['copy-button']}
                    onClick={handleOriginalClick}
                  >
                    <Icon height={24} name="translate" width={24} />
                    <span>
                      {translate.translate('showOriginal', profile.language)}
                    </span>
                  </button>
                )}
                {isLanguageSelectorOpened ? (
                  <LanguageSelector
                    language={profile.language}
                    onLanguageChange={handleLanguageSelect}
                  />
                ) : (
                  <button
                    className={styles['translate-button']}
                    onClick={handleTranslateClick}
                  >
                    <Icon height={24} name="translate" width={24} />
                    <span>
                      {translate.translate('translate', profile.language)}
                    </span>
                  </button>
                )}
              </>
            )}
            {(message.type === MessageType.TEXT ||
              (message.type === MessageType.AUDIO && message.content)) && (
              <>
                <button
                  className={styles['copy-button']}
                  onClick={handleCopyClick}
                >
                  <Icon height={24} name="copy" width={24} />
                  <span>{translate.translate('copy', profile.language)}</span>
                </button>
              </>
            )}
            {profile.id === message.sender.id &&
              message.type === MessageType.TEXT &&
              setEditingMessageId && (
                <button
                  className={styles['edit-button']}
                  onClick={handleEditClick}
                >
                  <Icon height={24} name="pencil" width={24} />
                  <span>{translate.translate('edit', profile.language)}</span>
                </button>
              )}
            {(profile.id === message.sender.id ||
              profile.id === chat.adminId) && (
              <button
                className={styles['delete-button']}
                onClick={handleDeleteClick}
              >
                <Icon height={24} name="trashBin" width={24} />
                <span>{translate.translate('delete', profile.language)}</span>
              </button>
            )}
          </div>
        </div>
      }
      isOpened={isOpened}
      onClose={handleClose}
    >
      {children}
    </Popover>
  );
};

export { MessagePopover };
