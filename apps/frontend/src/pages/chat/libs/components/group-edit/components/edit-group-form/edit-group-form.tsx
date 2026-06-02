import {
  type Control,
  type FieldErrors,
  type UseFormSetValue
} from 'react-hook-form';

import {
  CircularAvatarCropField,
  Input
} from '~/libs/components/components.js';
import { resolveServerMediaUrl } from '~/libs/helpers/helpers.js';
import {
  useAppSelector,
  useCallback,
  useEffect,
  useState
} from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { ChatPayloadKey } from '~/modules/chat/chat.js';
import { type GroupFormValues } from '~/pages/chat/libs/types/group-form-values.type.js';

import styles from './styles.module.scss';

type Properties = {
  control: Control<GroupFormValues, null>;
  errors: FieldErrors<GroupFormValues>;
  setValue: UseFormSetValue<GroupFormValues>;
};

const EditGroupForm = ({
  control,
  errors,
  setValue
}: Properties): JSX.Element => {
  const [imageUrl, setImageUrl] = useState<null | string>(null);
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const { profile } = useAppSelector(state => state.profile);

  useEffect(() => {
    if (!chat) {
      return;
    }

    setImageUrl(previous => {
      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }

      return chat.chatPicture ? resolveServerMediaUrl(chat.chatPicture) : null;
    });
  }, [chat]);

  const handleGroupPictureCropped = useCallback(
    (file: File): void => {
      setValue(ChatPayloadKey.GROUP_PICTURE, file);
      setImageUrl(previous => {
        if (previous?.startsWith('blob:')) {
          URL.revokeObjectURL(previous);
        }

        return URL.createObjectURL(file);
      });
    },
    [setValue]
  );

  if (!profile) {
    return <></>;
  }

  return (
    <form name="groupForm">
      <fieldset className={styles['fieldset']}>
        <div className={styles['imageGroup']}>
          <CircularAvatarCropField
            applyLabel={translate.translate('applyCrop', profile.language)}
            cameraIconClassName={
              imageUrl
                ? `${styles['cameraIcon']} ${styles['hasImage']}`
                : `${styles['cameraIcon']} ${styles['noImage']}`
            }
            cancelLabel={translate.translate('cancel', profile.language)}
            cropTitle={translate.translate('adjustAvatar', profile.language)}
            imagePreviewAlt={translate.translate(
              'groupPhotoPreview',
              profile.language
            )}
            imageUrl={imageUrl}
            inputId={ChatPayloadKey.GROUP_PICTURE}
            labelClassName={styles['groupPicture'] ?? ''}
            onCroppedFile={handleGroupPictureCropped}
            zoomLabel={translate.translate('avatarCropZoom', profile.language)}
          />
        </div>
        <div className={styles['GroupName']}>
          <label className={styles['label']} htmlFor={ChatPayloadKey.NAME}>
            {translate.translate('groupName', profile.language)}
          </label>
          <Input
            control={control}
            errors={errors}
            name={ChatPayloadKey.NAME}
            placeholder={translate.translate(
              'enterGroupName',
              profile.language
            )}
            type="text"
          />
        </div>
      </fieldset>
    </form>
  );
};

export { EditGroupForm };
