import { Icon, Popover } from '~/libs/components/components.js';
import { checkGreaterThanZero } from '~/libs/helpers/helpers.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { toastNotifier } from '~/libs/modules/toast-notifier/toast-notifier.js';
import { messageActions } from '~/modules/messages/message.js';

import styles from './styles.module.scss';

type Properties = {
  children: React.ReactNode;
  isOpened: boolean;
  onClose: () => void;
};

const FilePopover = ({
  children,
  isOpened,
  onClose
}: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);

  const handlePhotoOrVideoChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (
        chat &&
        event.target.files &&
        checkGreaterThanZero(event.target.files.length)
      ) {
        const [file] = event.target.files;

        if (file) {
          if (!profile) {
            return;
          }

          const isImage = file.type.includes('image');
          const clientMessageId = crypto.randomUUID();
          const sender = profile;
          const failToast = (): void => {
            toastNotifier.showError('Failed to send message');
          };

          if (isImage) {
            void dispatch(
              messageActions.writeImageMessage({
                chatId: chat.id,
                clientMessageId,
                payload: {
                  file
                },
                sender
              })
            )
              .unwrap()
              .catch(failToast);
          } else {
            void dispatch(
              messageActions.writeVideoMessage({
                chatId: chat.id,
                clientMessageId,
                payload: {
                  file
                },
                sender
              })
            )
              .unwrap()
              .catch(failToast);
          }
        }
      }
    },
    [chat, dispatch, profile]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (
        chat &&
        event.target.files &&
        checkGreaterThanZero(event.target.files.length)
      ) {
        const [file] = event.target.files;

        if (file) {
          if (!profile) {
            return;
          }

          const clientMessageId = crypto.randomUUID();

          void dispatch(
            messageActions.writeFileMessage({
              chatId: chat.id,
              clientMessageId,
              payload: {
                file
              },
              sender: profile
            })
          )
            .unwrap()
            .catch(() => {
              toastNotifier.showError('Failed to send message');
            });
        }
      }
    },
    [chat, dispatch, profile]
  );

  if (!profile) {
    return <></>;
  }

  return (
    <Popover
      className="file-popover"
      content={
        <div className={styles['file-popover']}>
          <div className={styles['buttons']}>
            <label className={styles['button']}>
              <Icon height={24} name="image" width={24} />
              {translate.translate('photoOrVideo', profile.language)}
              <input
                accept="image/*,video/*"
                onChange={handlePhotoOrVideoChange}
                style={{ display: 'none' }}
                type="file"
              />
            </label>
            <label className={styles['button']}>
              <Icon height={24} name="file" width={24} />
              {translate.translate('file', profile.language)}
              <input
                onChange={handleFileChange}
                style={{ display: 'none' }}
                type="file"
              />
            </label>
          </div>
        </div>
      }
      isOpened={isOpened}
      onClose={onClose}
      onMouseLeave={onClose}
    >
      {children}
    </Popover>
  );
};

export { FilePopover };
