type CallParticipantListPayload = {
  chatId: string;
  participantProfileIds: string[];
};

type CallUserJoinedPayload = CallParticipantListPayload & {
  joinedProfileId: string;
};

type CallUserLeftPayload = CallParticipantListPayload & {
  leftProfileId: string;
};

type WebRtcSignalClientPayload = {
  chatId: string;
  payload: unknown;
  toProfileId: string;
};

type WebRtcSignalRelayPayload = {
  chatId: string;
  fromProfileId: string;
  payload: unknown;
};

export {
  type CallParticipantListPayload,
  type CallUserJoinedPayload,
  type CallUserLeftPayload,
  type WebRtcSignalClientPayload,
  type WebRtcSignalRelayPayload
};
