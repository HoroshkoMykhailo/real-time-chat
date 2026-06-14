import { type WebRtcSignalRelayPayload } from '@team-link/shared';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';
import { SocketEvents } from '~/libs/modules/socket/libs/enums/enums.js';
import { emitWebRtcSignal, socket } from '~/libs/modules/socket/socket.js';

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const isIceCandidateInit = (value: unknown): value is RTCIceCandidateInit => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'candidate' in value;
};

const isSessionDescriptionInit = (
  value: unknown
): value is RTCSessionDescriptionInit => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { sdp?: unknown; type?: unknown };

  return (
    (candidate.type === 'offer' ||
      candidate.type === 'answer' ||
      candidate.type === 'rollback') &&
    typeof candidate.sdp === 'string'
  );
};

type UseVideoCallSessionParameters = {
  chatId: string;
  isSessionActive: boolean;
  localProfileId: string;
  participantProfileIds: string[];
};

type UseVideoCallSessionResult = {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  localStream: MediaStream | null;
  mediaAccessStatus: 'acquiring' | 'denied' | 'ready';
  remoteStreams: Map<string, MediaStream>;
  toggleAudio: () => void;
  toggleVideo: () => void;
};

const useVideoCallSession = ({
  chatId,
  isSessionActive,
  localProfileId,
  participantProfileIds
}: UseVideoCallSessionParameters): UseVideoCallSessionResult => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    () => new Map()
  );
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [mediaAccessStatus, setMediaAccessStatus] = useState<
    'acquiring' | 'denied' | 'ready'
  >('acquiring');

  const peersReference = useRef(new Map<string, RTCPeerConnection>());
  const iceQueuesReference = useRef(new Map<string, RTCIceCandidateInit[]>());
  const makingOfferReference = useRef(new Set<string>());
  const gUMCancelledReference = useRef(false);
  const isSessionActiveReference = useRef(isSessionActive);
  const localStreamReference = useRef<MediaStream | null>(null);
  const remoteStreamsReference = useRef(new Map<string, MediaStream>());

  isSessionActiveReference.current = isSessionActive;

  useEffect(() => {
    if (localStream) {
      localStreamReference.current = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    remoteStreamsReference.current = remoteStreams;
  }, [remoteStreams]);

  const stopLocalCapture = useCallback((): void => {
    const stream = localStreamReference.current;

    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }

    localStreamReference.current = null;
  }, []);

  const stopAllRemotePlayback = useCallback((): void => {
    for (const stream of remoteStreamsReference.current.values()) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }

    remoteStreamsReference.current = new Map();
  }, []);

  useEffect(() => {
    return (): void => {
      for (const peerConnection of peersReference.current.values()) {
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.close();
      }

      peersReference.current.clear();
      iceQueuesReference.current.clear();
      makingOfferReference.current.clear();

      stopAllRemotePlayback();
      stopLocalCapture();
    };
  }, [stopAllRemotePlayback, stopLocalCapture]);

  const participantKey = useMemo(
    () =>
      [...participantProfileIds]
        .toSorted((left, right) => {
          return left.localeCompare(right);
        })
        .join(','),
    [participantProfileIds]
  );

  const flushIceQueue = useCallback(
    async (remoteProfileId: string, peerConnection: RTCPeerConnection) => {
      const queue = iceQueuesReference.current.get(remoteProfileId) ?? [];

      for (const candidate of queue) {
        try {
          await peerConnection.addIceCandidate(candidate);
        } catch {
          // Ignore invalid/expired candidates during negotiation.
        }
      }

      iceQueuesReference.current.set(remoteProfileId, []);
    },
    []
  );

  const removePeer = useCallback((remoteProfileId: string) => {
    const peerConnection = peersReference.current.get(remoteProfileId);

    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.close();
      peersReference.current.delete(remoteProfileId);
    }

    iceQueuesReference.current.delete(remoteProfileId);
    makingOfferReference.current.delete(remoteProfileId);
    setRemoteStreams(previous => {
      const next = new Map(previous);
      const stream = next.get(remoteProfileId);

      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }

      next.delete(remoteProfileId);

      return next;
    });
  }, []);

  const sendSignal = useCallback(
    (toProfileId: string, payload: unknown): void => {
      emitWebRtcSignal({ chatId, payload, toProfileId });
    },
    [chatId]
  );

  const attachLocalTracks = useCallback(
    (peerConnection: RTCPeerConnection, stream: MediaStream) => {
      for (const track of stream.getTracks()) {
        peerConnection.addTrack(track, stream);
      }
    },
    []
  );

  const createPeerConnection = useCallback(
    (remoteProfileId: string, stream: MediaStream): RTCPeerConnection => {
      const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

      peerConnection.onicecandidate = (
        event: RTCPeerConnectionIceEvent
      ): void => {
        if (!event.candidate) {
          return;
        }

        sendSignal(remoteProfileId, event.candidate.toJSON());
      };

      peerConnection.ontrack = (event: RTCTrackEvent): void => {
        const [firstStream] = event.streams;

        if (firstStream) {
          setRemoteStreams(previous =>
            new Map(previous).set(remoteProfileId, firstStream)
          );
        }
      };

      attachLocalTracks(peerConnection, stream);

      return peerConnection;
    },
    [attachLocalTracks, sendSignal]
  );

  const negotiateAsCaller = useCallback(
    async (remoteProfileId: string, stream: MediaStream) => {
      const existing = peersReference.current.get(remoteProfileId);

      if (existing?.connectionState === 'connected') {
        return;
      }

      if (
        existing &&
        (existing.signalingState === 'have-local-offer' ||
          existing.signalingState === 'have-remote-offer')
      ) {
        return;
      }

      let peerConnection = existing;

      if (!peerConnection) {
        peerConnection = createPeerConnection(remoteProfileId, stream);
        peersReference.current.set(remoteProfileId, peerConnection);
      }

      makingOfferReference.current.add(remoteProfileId);

      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        sendSignal(remoteProfileId, peerConnection.localDescription);
      } finally {
        makingOfferReference.current.delete(remoteProfileId);
      }

      await flushIceQueue(remoteProfileId, peerConnection);
    },
    [createPeerConnection, flushIceQueue, sendSignal]
  );

  const handleRemoteDescription = useCallback(
    async (
      fromProfileId: string,
      description: RTCSessionDescriptionInit,
      stream: MediaStream
    ) => {
      let peerConnection = peersReference.current.get(fromProfileId);

      if (!peerConnection) {
        peerConnection = createPeerConnection(fromProfileId, stream);
        peersReference.current.set(fromProfileId, peerConnection);
      }

      await peerConnection.setRemoteDescription(description);

      if (description.type === 'offer') {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendSignal(fromProfileId, peerConnection.localDescription);
      }

      await flushIceQueue(fromProfileId, peerConnection);
    },
    [createPeerConnection, flushIceQueue, sendSignal]
  );

  const handleRemoteIce = useCallback(
    async (fromProfileId: string, candidate: RTCIceCandidateInit) => {
      const peerConnection = peersReference.current.get(fromProfileId);

      if (!peerConnection?.remoteDescription) {
        const queue = iceQueuesReference.current.get(fromProfileId) ?? [];
        queue.push(candidate);
        iceQueuesReference.current.set(fromProfileId, queue);

        return;
      }

      try {
        await peerConnection.addIceCandidate(candidate);
      } catch {
        // Ignore ICE add failures (common during renegotiation).
      }
    },
    []
  );

  useEffect(() => {
    if (!isSessionActive) {
      return;
    }

    const handleSignal = (relay: WebRtcSignalRelayPayload): void => {
      if (relay.chatId !== chatId || relay.fromProfileId === localProfileId) {
        return;
      }

      void (async (): Promise<void> => {
        const stream = localStreamReference.current;

        if (!stream) {
          return;
        }

        if (isSessionDescriptionInit(relay.payload)) {
          await handleRemoteDescription(
            relay.fromProfileId,
            relay.payload,
            stream
          );
        } else if (isIceCandidateInit(relay.payload)) {
          await handleRemoteIce(relay.fromProfileId, relay.payload);
        }
      })();
    };

    socket.on(SocketEvents.WEBRTC_SIGNAL, handleSignal);

    return (): void => {
      socket.off(SocketEvents.WEBRTC_SIGNAL, handleSignal);
    };
  }, [
    chatId,
    handleRemoteDescription,
    handleRemoteIce,
    isSessionActive,
    localProfileId
  ]);

  useLayoutEffect(() => {
    if (isSessionActive) {
      return;
    }

    for (const remoteId of peersReference.current.keys()) {
      removePeer(remoteId);
    }

    stopLocalCapture();
    setLocalStream(null);
    setRemoteStreams(new Map());
    setIsAudioEnabled(true);
    setIsVideoEnabled(true);
    setMediaAccessStatus('acquiring');
  }, [isSessionActive, removePeer, stopLocalCapture]);

  useEffect(() => {
    if (!isSessionActive) {
      return;
    }

    gUMCancelledReference.current = false;

    setMediaAccessStatus('acquiring');

    void (async (): Promise<void> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });

        if (
          gUMCancelledReference.current ||
          !isSessionActiveReference.current
        ) {
          for (const track of stream.getTracks()) {
            track.stop();
          }

          return;
        }

        setLocalStream(stream);
        const [firstAudio] = stream.getAudioTracks();
        const [firstVideo] = stream.getVideoTracks();
        setIsAudioEnabled(firstAudio?.enabled ?? true);
        setIsVideoEnabled(firstVideo?.enabled ?? true);
        setMediaAccessStatus('ready');
      } catch {
        if (gUMCancelledReference.current) {
          return;
        }

        setLocalStream(null);
        setMediaAccessStatus('denied');
      }
    })();

    return (): void => {
      gUMCancelledReference.current = true;
      stopLocalCapture();
    };
  }, [isSessionActive, stopLocalCapture]);

  useEffect(() => {
    if (!isSessionActive) {
      return;
    }

    const stream = localStreamReference.current;

    if (!stream) {
      return;
    }

    const remoteIds = participantProfileIds
      .filter(id => id !== localProfileId)
      .toSorted((left, right) => {
        return left.localeCompare(right);
      });

    for (const existingId of peersReference.current.keys()) {
      if (!remoteIds.includes(existingId)) {
        removePeer(existingId);
      }
    }

    for (const remoteId of remoteIds) {
      if (localProfileId < remoteId) {
        void negotiateAsCaller(remoteId, stream);
      }
    }
  }, [
    isSessionActive,
    localProfileId,
    localStream,
    negotiateAsCaller,
    participantKey,
    removePeer
  ]);

  const toggleAudio = useCallback((): void => {
    const stream = localStreamReference.current;

    if (!stream) {
      return;
    }

    const [audioTrack] = stream.getAudioTracks();

    if (!audioTrack) {
      return;
    }

    audioTrack.enabled = !audioTrack.enabled;
    setIsAudioEnabled(audioTrack.enabled);
  }, []);

  const toggleVideo = useCallback((): void => {
    const stream = localStreamReference.current;

    if (!stream) {
      return;
    }

    const [videoTrack] = stream.getVideoTracks();

    if (!videoTrack) {
      return;
    }

    videoTrack.enabled = !videoTrack.enabled;
    setIsVideoEnabled(videoTrack.enabled);
  }, []);

  return {
    isAudioEnabled,
    isVideoEnabled,
    localStream,
    mediaAccessStatus,
    remoteStreams,
    toggleAudio,
    toggleVideo
  };
};

export { useVideoCallSession, type UseVideoCallSessionResult };
