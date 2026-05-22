import { resolveServerMediaUrl } from '~/libs/helpers/helpers.js';
import { ChatType } from '~/modules/chat/chat.js';
import { type Chats } from '~/modules/chat/libs/types/types.js';
import { MessageType } from '~/modules/messages/message.js';

import { MessagePreviewContent } from './components/message-preview-content.js';
import styles from './styles.module.scss';

type Properties = {
  message: Chats[number]['lastMessage'];
  type: Chats[number]['type'];
};

const MessagePreview = ({ message, type }: Properties): JSX.Element => {
  if (!message) {
    return <></>;
  }

  const isFile = message.type === MessageType.FILE;
  const isImage = message.type === MessageType.IMAGE;
  const isVideo = message.type === MessageType.VIDEO;
  const isAudio = message.type === MessageType.AUDIO;
  const imageUrl = isImage ? resolveServerMediaUrl(message.fileUrl) : '';
  const videoUrl = isVideo ? resolveServerMediaUrl(message.fileUrl) : '';

  if (type === ChatType.GROUP && message.senderName) {
    return (
      <>
        <span className={styles['sender-name']}>{message.senderName}:</span>
        <MessagePreviewContent
          imageUrl={imageUrl}
          isAudio={isAudio}
          isFile={isFile}
          isImage={isImage}
          isVideo={isVideo}
          message={message}
          videoUrl={videoUrl}
        />
      </>
    );
  }

  return (
    <MessagePreviewContent
      imageUrl={imageUrl}
      isAudio={isAudio}
      isFile={isFile}
      isImage={isImage}
      isVideo={isVideo}
      message={message}
      videoUrl={videoUrl}
    />
  );
};

export { MessagePreview };
