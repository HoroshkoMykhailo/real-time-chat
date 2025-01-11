import { Button, CreateGroupHeader } from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppForm,
  useAppSelector,
  useCallback
} from '~/libs/hooks/hooks.js';
import {
  chatActions,
  chatUpdateValidationSchema
} from '~/modules/chat/chat.js';
import { type ChatUpdateRequestDto } from '~/modules/chat/libs/types/types.js';

import { type GroupFormValues } from '../../types/group-form-values.type.js';
import { EditGroupForm } from './components/edit-group-form/edit-group-form.js';
import styles from './styles.module.scss';

type Properties = {
  onCancel: () => void;
};

const GroupEdit = ({ onCancel }: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedChat: chat } = useAppSelector(state => state.chat);

  const { control, errors, handleSubmit, setValue } =
    useAppForm<GroupFormValues>({
      defaultValues: {
        groupPicture: null,
        name: chat?.name ?? ''
      },
      validationSchema: chatUpdateValidationSchema
    });

  const handleFormSubmit = useCallback(
    (values: GroupFormValues): void => {
      const group: ChatUpdateRequestDto = {
        groupPicture: values.groupPicture,
        name: values.name
      };

      if (chat) {
        void dispatch(chatActions.updateGroup({ id: chat.id, payload: group }));
        onCancel();
      }
    },
    [chat, dispatch, onCancel]
  );

  const handleContinueClick = useCallback(() => {
    void handleSubmit(handleFormSubmit)();
  }, [handleFormSubmit, handleSubmit]);

  if (!chat) {
    return <></>;
  }

  return (
    <div className={styles['group-edit-container']}>
      <CreateGroupHeader isEditGroup onContinueClick={handleContinueClick} />
      <EditGroupForm control={control} errors={errors} setValue={setValue} />
      <div className={styles['cancel-button-wrapper'] ?? ''}>
        <Button
          className={styles['cancel-button'] ?? ''}
          color={ButtonColor.TEAL}
          isPrimary
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export { GroupEdit };
