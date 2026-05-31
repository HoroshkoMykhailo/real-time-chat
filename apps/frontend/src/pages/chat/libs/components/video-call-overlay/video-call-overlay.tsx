import { Icon } from '~/libs/components/icon/icon.js';
import { useEffect, useMemo, useRef } from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { emitCallJoin } from '~/libs/modules/socket/socket.js';
import { type ValueOf } from '~/libs/types/types.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';

import { useVideoCallSession } from '../../hooks/use-video-call-session.js';
import styles from './styles.module.scss';

type MemberLabel = {
  id: string;
  name: string;
};

type Properties = {
  chatId: string;
  isOpen: boolean;
  language: ValueOf<typeof ProfileLanguage>;
  localProfileId: string;
  memberLabels: MemberLabel[];
  onLeave: () => void;
  participantProfileIds: string[];
};

const VideoCallOverlay = ({
  chatId,
  isOpen,
  language,
  localProfileId,
  memberLabels,
  onLeave,
  participantProfileIds
}: Properties): JSX.Element | null => {
  const joinEmittedReference = useRef(false);
  const localVideoReference = useRef<HTMLVideoElement>(null);

  const {
    isAudioEnabled,
    isVideoEnabled,
    localStream,
    mediaAccessStatus,
    remoteStreams,
    toggleAudio,
    toggleVideo
  } = useVideoCallSession({
    chatId,
    isSessionActive: isOpen,
    localProfileId,
    participantProfileIds
  });

  const nameById = useMemo(() => {
    return new Map(memberLabels.map(member => [member.id, member.name]));
  }, [memberLabels]);

  const orderedRemoteIds = useMemo(() => {
    return [...participantProfileIds]
      .filter(id => id !== localProfileId)
      .toSorted((left, right) => {
        return left.localeCompare(right);
      });
  }, [localProfileId, participantProfileIds]);

  useEffect(() => {
    if (!isOpen) {
      joinEmittedReference.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !localStream || joinEmittedReference.current) {
      return;
    }

    joinEmittedReference.current = true;
    emitCallJoin(chatId);
  }, [chatId, isOpen, localStream]);

  useEffect(() => {
    const element = localVideoReference.current;

    if (element && localStream) {
      element.srcObject = localStream;
    }
  }, [localStream]);

  if (!isOpen) {
    return null;
  }

  const localDisplayName = nameById.get(localProfileId) ?? '';
  const youLabel = translate.translate('videoYou', language);

  return (
    <div aria-modal className={styles['overlay']} role="dialog">
      <div className={styles['backdrop']} />
      <div className={styles['panel']}>
        <div className={styles['grid']}>
          <div className={styles['tile']}>
            <video
              autoPlay
              className={styles['video']}
              muted
              playsInline
              ref={localVideoReference}
            />
            <div className={styles['label']}>
              {localDisplayName
                ? `${localDisplayName} (${youLabel})`
                : youLabel}
            </div>
            {mediaAccessStatus === 'acquiring' && !localStream ? (
              <div className={styles['placeholder']}>
                {translate.translate('videoConnecting', language)}
              </div>
            ) : null}
          </div>
          {orderedRemoteIds.map(profileId => {
            const stream = remoteStreams.get(profileId) ?? null;

            return (
              <div className={styles['tile']} key={profileId}>
                <video
                  autoPlay
                  className={styles['video']}
                  playsInline
                  ref={element => {
                    if (element) {
                      element.srcObject = stream;
                    }
                  }}
                />
                <div className={styles['label']}>
                  {nameById.get(profileId) ?? profileId}
                </div>
                {stream ? null : (
                  <div className={styles['placeholder']}>
                    {translate.translate('videoConnecting', language)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {mediaAccessStatus === 'denied' ? (
          <p className={styles['error']}>
            {translate.translate('videoPermissionError', language)}
          </p>
        ) : null}
        <div className={styles['controls']}>
          <button
            aria-label={translate.translate('videoToggleMic', language)}
            aria-pressed={!isAudioEnabled}
            className={`${styles['control']} ${isAudioEnabled ? '' : styles['control-off']}`}
            onClick={toggleAudio}
            type="button"
          >
            <Icon height={26} name="microphone" width={26} />
          </button>
          <button
            aria-label={translate.translate('videoToggleCamera', language)}
            aria-pressed={!isVideoEnabled}
            className={`${styles['control']} ${isVideoEnabled ? '' : styles['control-off']}`}
            onClick={toggleVideo}
            type="button"
          >
            <Icon height={26} name="camera" width={26} />
          </button>
          <button
            className={`${styles['control']} ${styles['leave']}`}
            onClick={onLeave}
            type="button"
          >
            {translate.translate('leaveVideoCall', language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export { VideoCallOverlay };
