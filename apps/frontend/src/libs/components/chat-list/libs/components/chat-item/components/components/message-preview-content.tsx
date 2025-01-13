import { FileIcon, Icon, Image } from '~/libs/components/components.js';
import { type Chats } from '~/modules/chat/libs/types/types.js';

const MESSAGE_CONTENT = 'message-content';

import styles from '../../../../../styles.module.scss';

type Properties = {
  imageUrl: string;
  isAudio: boolean;
  isFile: boolean;
  isImage: boolean;
  isVideo: boolean;
  message: Chats[number]['lastMessage'];
  videoUrl: string;
};

const MessagePreviewContent = ({
  imageUrl,
  isAudio,
  isFile,
  isImage,
  isVideo,
  message,
  videoUrl
}: Properties): JSX.Element => {
  if (!message) {
    return <></>;
  }

  const renderItems = [
    isFile && <FileIcon height={15} key="file-icon" width={15} />,
    isFile && (
      <span className={styles[MESSAGE_CONTENT]} key="file-label">
        {message.content}
      </span>
    ),
    isImage && (
      <Image
        alt={message.content}
        className={styles['message-image'] ?? ''}
        key="image-content"
        src={imageUrl}
      />
    ),
    isImage && (
      <span className={styles[MESSAGE_CONTENT]} key="image-label">
        Image
      </span>
    ),
    isVideo && (
      <video
        className={styles['video-preview']}
        key="video-content"
        muted
        preload="metadata"
        src={videoUrl}
      />
    ),
    isVideo && (
      <span className={styles[MESSAGE_CONTENT]} key="video-label">
        Video
      </span>
    ),
    isAudio && (
      <div className={styles['audio-preview']} key="audio-preview">
        <Icon height={24} name="microphonePreview" width={24} />
      </div>
    ),
    isAudio && (
      <span className={styles[MESSAGE_CONTENT]} key="audio-label">
        Voice Message
      </span>
    ),
    !isFile && !isImage && !isVideo && !isAudio && (
      <span className={styles[MESSAGE_CONTENT]} key="text-content">
        {message.content}
      </span>
    )
  ];

  return <>{renderItems.filter(Boolean)}</>;
};

export { MessagePreviewContent };
