import { type CSSProperties } from 'react';

import { Icon, Popover } from '~/libs/components/components.js';
import { type GetPortalStyleArguments } from '~/libs/components/popover/popover.js';
import { NotificationMessage } from '~/libs/enums/enums.js';
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
import {
  messageActions,
  type MessageLanguage,
  MessageType
} from '~/modules/messages/message.js';

import { LanguageSelector } from './components/language-selector/language-selector.js';
import styles from './styles.module.scss';

const POPOVER_CLASS = 'message-popover';
const POPOVER_OFFSET = 80;
const MESSAGE_POPOVER_UP_CLASS = 'message-popover-up';
const HORIZONTAL_OFFSET_REM = 8;
const VERTICAL_ANCHOR_OFFSET_REM = 3;
const PORTAL_BELOW_ANCHOR_GAP_PX = 4;

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
  const { messages } = useAppSelector(state => state.message);
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
    if (!message) {
      return;
    }

    // Defer until after this click finishes bubbling to `document`. Otherwise
    // `useHandleClickOutside` runs while `event.target` is already detached from
    // the portal tree and treats the click as "outside", closing the popover.
    queueMicrotask(() => {
      setIsLanguageSelectorOpened(true);
    });
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
      const text = message.translatedMessage || message.content;

      void navigator.clipboard.writeText(text);
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
      // eslint-disable-next-line sonarjs/void-use -- RTK thunk; intentional fire-and-forget
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

  const getPortalStyle = useCallback(
    ({ anchorRect }: GetPortalStyleArguments): CSSProperties => {
      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const left = anchorRect.left + HORIZONTAL_OFFSET_REM * rootFontSize;

      if (popoverClass === MESSAGE_POPOVER_UP_CLASS) {
        return {
          bottom:
            globalThis.innerHeight -
            anchorRect.bottom +
            VERTICAL_ANCHOR_OFFSET_REM * rootFontSize,
          left
        };
      }

      return {
        left,
        top: anchorRect.bottom + PORTAL_BELOW_ANCHOR_GAP_PX
      };
    },
    [popoverClass]
  );

  useEffect(() => {
    if (popoverReference.current) {
      const rect = popoverReference.current.getBoundingClientRect();
      const isNearBottom = rect.bottom > window.innerHeight - POPOVER_OFFSET;

      setPopoverClass(isNearBottom ? MESSAGE_POPOVER_UP_CLASS : POPOVER_CLASS);
    }
  }, [isOpened]);

  if (!message || !chat || !profile) {
    return <></>;
  }

  return (
    <Popover
      className={popoverClass}
      content={
        <div className={styles[POPOVER_CLASS]} ref={popoverReference}>
          <div className={styles['buttons']}>
            <button
              className={styles['pin-button']}
              onClick={handlePinClick}
              type="button"
            >
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
                type="button"
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
                    type="button"
                  >
                    <Icon height={24} name="translate" width={24} />
                    <span>
                      {translate.translate('showOriginal', profile.language)}
                    </span>
                  </button>
                )}
                {isLanguageSelectorOpened ? (
                  <div className={styles['language-selector-stack']}>
                    <LanguageSelector
                      language={profile.language}
                      onLanguageChange={handleLanguageSelect}
                    />
                  </div>
                ) : (
                  <button
                    className={styles['translate-button']}
                    onClick={handleTranslateClick}
                    type="button"
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
                  type="button"
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
                  type="button"
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
                type="button"
              >
                <Icon height={24} name="trashBin" width={24} />
                <span>{translate.translate('delete', profile.language)}</span>
              </button>
            )}
          </div>
        </div>
      }
      getPortalStyle={getPortalStyle}
      isOpened={isOpened}
      onClose={handleClose}
      usePortal
    >
      {children}
    </Popover>
  );
};

export { MessagePopover };
