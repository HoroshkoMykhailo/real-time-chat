import { Icon, Popover } from '~/libs/components/components.js';
import { checkGreaterThanZero } from '~/libs/helpers/helpers.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
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
          const isImage = file.type.includes('image');

          if (isImage) {
            void dispatch(
              messageActions.writeImageMessage({
                chatId: chat.id,
                payload: {
                  file
                }
              })
            );
          } else {
            void dispatch(
              messageActions.writeVideoMessage({
                chatId: chat.id,
                payload: {
                  file
                }
              })
            );
          }
        }
      }
    },
    [chat, dispatch]
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
          void dispatch(
            messageActions.writeFileMessage({
              chatId: chat.id,
              payload: {
                file
              }
            })
          );
        }
      }
    },
    [chat, dispatch]
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
