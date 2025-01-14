import {
  type Control,
  type FieldErrors,
  type UseFormSetValue
} from 'react-hook-form';

import { Icon, Image, Input } from '~/libs/components/components.js';
import { checkGreaterThanZero } from '~/libs/helpers/helpers.js';
import { useAppSelector, useCallback, useState } from '~/libs/hooks/hooks.js';
import { ChatPayloadKey } from '~/modules/chat/chat.js';

import { type GroupFormValues } from '../../types/group-form-values.type.js';
import styles from './styles.module.scss';
// eslint-disable-next-line perfectionist/sort-imports
import { translate } from '~/libs/modules/localization/translate.js';

type Properties = {
  control: Control<GroupFormValues, null>;
  errors: FieldErrors<GroupFormValues>;
  setValue: UseFormSetValue<GroupFormValues>;
};

const GroupForm = ({ control, errors, setValue }: Properties): JSX.Element => {
  const [imageUrl, setImageUrl] = useState<null | string>(null);

  const { profile } = useAppSelector(state => state.profile);

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (
        event.target.files &&
        checkGreaterThanZero(event.target.files.length)
      ) {
        const [file] = event.target.files;

        if (file) {
          setImageUrl(URL.createObjectURL(file));
          setValue(ChatPayloadKey.GROUP_PICTURE, file);
        }
      }
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
          <label
            className={styles['groupPicture']}
            htmlFor={ChatPayloadKey.GROUP_PICTURE}
          >
            {imageUrl ? (
              <>
                <Image
                  alt="Selected"
                  height="144"
                  isCircular
                  src={imageUrl}
                  width="144"
                />
                <div
                  className={`${styles['cameraIcon']} ${styles['hasImage']}`}
                >
                  <Icon height={48} name="camera" width={48} />
                </div>
              </>
            ) : (
              <div className={`${styles['cameraIcon']} ${styles['noImage']}`}>
                <Icon height={48} name="camera" width={48} />
              </div>
            )}
            <input
              accept="image/*"
              id={ChatPayloadKey.GROUP_PICTURE}
              onChange={handleImageChange}
              style={{ display: 'none' }}
              type="file"
            />
          </label>
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

export { GroupForm };
