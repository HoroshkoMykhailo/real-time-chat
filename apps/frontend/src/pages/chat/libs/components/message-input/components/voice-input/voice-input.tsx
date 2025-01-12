import { ZERO_VALUE } from '~/libs/common/constants.js';
import { Icon } from '~/libs/components/components.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { messageActions } from '~/modules/messages/message.js';

import styles from './styles.module.scss';

const VoiceInput = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedChat: chat } = useAppSelector(state => state.chat);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderReference = useRef<MediaRecorder | null>(null);
  const audioChunksReference = useRef<Blob[]>([]);

  const handleStartRecording = useCallback(async () => {
    if (isRecording || !chat) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderReference.current = mediaRecorder;
    audioChunksReference.current = [];

    mediaRecorder.ondataavailable = (event): void => {
      if (event.data.size > ZERO_VALUE) {
        audioChunksReference.current.push(event.data);
      }
    };

    mediaRecorder.onstop = (): void => {
      const audioBlob = new Blob(audioChunksReference.current, {
        type: 'audio/webm'
      });
      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: 'audio/webm'
      });

      void dispatch(
        messageActions.writeAudioMessage({
          chatId: chat.id,
          payload: {
            file: audioFile
          }
        })
      );
    };

    mediaRecorder.start();
    setIsRecording(true);
  }, [chat, dispatch, isRecording]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderReference.current) {
      mediaRecorderReference.current.stop();

      const { stream } = mediaRecorderReference.current;

      for (const track of stream.getTracks()) {
        track.stop();
      }
    }

    setIsRecording(false);
  }, []);

  return (
    <button
      className={`${styles['voice-button']} ${isRecording ? styles['recording'] : ''}`}
      onMouseDown={handleStartRecording}
      onMouseLeave={handleStopRecording}
      onMouseUp={handleStopRecording}
      type="button"
    >
      <Icon height={24} name="microphone" width={24} />
    </button>
  );
};

export { VoiceInput };
