import { FileIcon } from '~/libs/components/components.js';
import { DataStatus, ENV } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect
} from '~/libs/hooks/hooks.js';
import { type MessageCreationResponseDto } from '~/modules/messages/libs/types/types.js';
import { messageActions } from '~/modules/messages/message.js';

import styles from './styles.module.scss';

type Properties = {
  fileMessage: MessageCreationResponseDto;
};

const FileMessage = ({ fileMessage }: Properties): JSX.Element => {
  const dispatch = useAppDispatch();
  const { editDataStatus, fileBlob } = useAppSelector(state => state.message);
  const { content: fileName, fileUrl: file, id: messageId } = fileMessage;
  const fileUrl = `${ENV.SERVER_URL}${file}`;

  const handleDownload = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      if (!fileName) {
        return;
      }

      void dispatch(
        messageActions.downloadFile({
          messageId
        })
      );
    },
    [fileName, dispatch, messageId]
  );

  useEffect(() => {
    if (editDataStatus === DataStatus.FULFILLED && fileBlob) {
      const downloadBlob = new Blob([fileBlob], {
        type: 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  }, [editDataStatus, fileBlob, fileName]);

  return (
    <div className={styles['file-message']}>
      <FileIcon href={fileUrl} onClick={handleDownload} />
      <span className={styles['file-name']}>{fileName}</span>
    </div>
  );
};

export { FileMessage };
