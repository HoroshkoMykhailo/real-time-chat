import {
  type CallParticipantListPayload,
  type CallUserJoinedPayload,
  type CallUserLeftPayload,
  type WebRtcSignalClientPayload,
  type WebRtcSignalRelayPayload
} from '@team-link/shared';
import { type Server as IOServer, type Socket } from 'socket.io';

import { type MessageService } from '~/modules/message/libs/types/types.js';
import { type UserService } from '~/modules/user/user.js';

import { type LoggerModule } from '../logger/logger.js';
import { type Token } from '../token/token.js';
import { SocketEvents } from './libs/enums/enums.js';

const DEFAULT_VALUE = 0;

const userRoomId = (profileId: string): string => `user:${profileId}`;

type CallRoom = {
  sockets: Map<string, string>;
};

type Constructor = {
  io: IOServer;
  logger: LoggerModule;
  messageService: MessageService;
  token: Token;
  userService: UserService;
};

type SocketData = {
  profileId?: string;
};

class SocketModule {
  #callsByChatId = new Map<string, CallRoom>();
  #io: IOServer;
  #logger: LoggerModule;
  #messageService: MessageService;
  #rooms: Map<string, Set<string>>;
  #token: Token;
  #userService: UserService;

  public constructor({
    io,
    logger,
    messageService,
    token,
    userService
  }: Constructor) {
    this.#io = io;
    this.#logger = logger;
    this.#messageService = messageService;
    this.#token = token;
    this.#userService = userService;
    this.#rooms = new Map();
    this.#initializeHandlers();
  }

  #addSocketToRoom(socketId: string, chatId: string): void {
    if (!this.#rooms.has(chatId)) {
      this.#rooms.set(chatId, new Set());
    }

    this.#rooms.get(chatId)?.add(socketId);
  }

  #emitCallStateToSocket(socket: Socket, chatId: string): void {
    const call = this.#callsByChatId.get(chatId);

    if (!call || call.sockets.size === DEFAULT_VALUE) {
      return;
    }

    const payload: CallParticipantListPayload = {
      chatId,
      participantProfileIds: this.#getParticipantProfileIds(call)
    };

    socket.emit(SocketEvents.CALL_STATE, payload);
  }

  #getParticipantProfileIds(call: CallRoom): string[] {
    return [...new Set(call.sockets.values())].toSorted((left, right) => {
      return left.localeCompare(right);
    });
  }

  #getProfileId(socket: Socket): null | string {
    const socketData = socket.data as SocketData;
    const { profileId } = socketData;

    return typeof profileId === 'string' && profileId.length > DEFAULT_VALUE
      ? profileId
      : null;
  }

  #handleCallJoin(socket: Socket, raw: unknown): void {
    const profileId = this.#getProfileId(socket);

    if (!profileId) {
      return;
    }

    if (!this.#isPlainObject(raw)) {
      return;
    }

    const { chatId } = raw;

    if (typeof chatId !== 'string') {
      return;
    }

    if (!this.#isSocketInRoom(socket.id, chatId)) {
      this.#logger.info(
        `Socket ${socket.id}: call_join ignored (not in chat room)`
      );

      return;
    }

    let call = this.#callsByChatId.get(chatId);

    if (!call) {
      call = { sockets: new Map() };
      this.#callsByChatId.set(chatId, call);
    }

    const previousCount = call.sockets.size;
    const wasProfilePresent = [...call.sockets.values()].includes(profileId);

    call.sockets.set(socket.id, profileId);

    const participantProfileIds = this.#getParticipantProfileIds(call);

    if (previousCount === DEFAULT_VALUE) {
      const payload: CallParticipantListPayload = {
        chatId,
        participantProfileIds
      };
      this.#io.to(chatId).emit(SocketEvents.CALL_INITIATED, payload);
      void this.#messageService
        .recordGroupVideoCallStarted({
          chatId,
          starterProfileId: profileId
        })
        .catch((error: unknown) => {
          this.#logger.error('recordGroupVideoCallStarted failed', {
            ...(error instanceof Error && { message: error.message })
          });
        });
    } else if (wasProfilePresent) {
      const payload: CallParticipantListPayload = {
        chatId,
        participantProfileIds
      };
      socket.emit(SocketEvents.CALL_STATE, payload);
    } else {
      const payload: CallUserJoinedPayload = {
        chatId,
        joinedProfileId: profileId,
        participantProfileIds
      };
      this.#io.to(chatId).emit(SocketEvents.CALL_USER_JOINED, payload);
    }

    if (!wasProfilePresent) {
      const syncPayload: CallParticipantListPayload = {
        chatId,
        participantProfileIds
      };
      this.#io.to(chatId).emit(SocketEvents.CALL_STATE, syncPayload);
    }
  }

  #handleCallLeave(socket: Socket, raw: unknown): void {
    const profileId = this.#getProfileId(socket);

    if (!profileId) {
      return;
    }

    if (!this.#isPlainObject(raw)) {
      return;
    }

    const { chatId } = raw;

    if (typeof chatId !== 'string') {
      return;
    }
    this.#removeSocketFromCall(socket, chatId);
  }

  #handleSocketDisconnectFromCalls(socket: Socket): void {
    for (const chatId of this.#callsByChatId.keys()) {
      this.#removeSocketFromCall(socket, chatId);
    }
  }

  #handleWebRtcSignal(socket: Socket, raw: unknown): void {
    const fromProfileId = this.#getProfileId(socket);

    if (!fromProfileId) {
      return;
    }

    if (!this.#isWebRtcSignalPayload(raw)) {
      return;
    }

    const { chatId, payload, toProfileId } = raw;

    if (!this.#isSocketInRoom(socket.id, chatId)) {
      return;
    }

    const call = this.#callsByChatId.get(chatId);

    if (!call?.sockets.has(socket.id)) {
      return;
    }

    const relay: WebRtcSignalRelayPayload = {
      chatId,
      fromProfileId,
      payload
    };

    this.#io
      .to(userRoomId(toProfileId))
      .emit(SocketEvents.WEBRTC_SIGNAL, relay);
  }

  #initializeHandlers(): void {
    this.#io.on(SocketEvents.CONNECT, (socket: Socket) => {
      this.#logger.info(`Socket connected: ${socket.id}`);

      socket.on(SocketEvents.REGISTER_USER, (jwtToken: unknown) => {
        void this.#registerUser(socket, jwtToken);
      });

      socket.on(SocketEvents.JOIN_CHAT, (chatId: string) => {
        this.#logger.info(`User ${socket.id} joined chat ${chatId}`);
        this.#addSocketToRoom(socket.id, chatId);
        void socket.join(chatId);
        this.#emitCallStateToSocket(socket, chatId);
      });

      socket.on(SocketEvents.LEAVE_CHAT, (chatId: string) => {
        this.#logger.info(`User ${socket.id} left chat ${chatId}`);

        if (this.#isSocketInRoom(socket.id, chatId)) {
          this.#removeSocketFromRoom(socket.id, chatId);
          void socket.leave(chatId);
        } else {
          this.#logger.info(`User ${socket.id} was not in chat ${chatId}`);
        }
      });

      socket.on(SocketEvents.CALL_JOIN, (raw: unknown) => {
        this.#handleCallJoin(socket, raw);
      });

      socket.on(SocketEvents.CALL_LEAVE, (raw: unknown) => {
        this.#handleCallLeave(socket, raw);
      });

      socket.on(SocketEvents.WEBRTC_SIGNAL, (raw: unknown) => {
        this.#handleWebRtcSignal(socket, raw);
      });

      socket.on(SocketEvents.DISCONNECT, () => {
        this.#logger.info(`Socket disconnected: ${socket.id}`);
        this.#handleSocketDisconnectFromCalls(socket);
      });
    });
  }

  #isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  #isSocketInRoom(socketId: string, chatId: string): boolean {
    return this.#rooms.has(chatId) && !!this.#rooms.get(chatId)?.has(socketId);
  }

  #isWebRtcSignalPayload(raw: unknown): raw is WebRtcSignalClientPayload {
    if (!this.#isPlainObject(raw)) {
      return false;
    }

    return (
      typeof raw['chatId'] === 'string' &&
      typeof raw['toProfileId'] === 'string' &&
      'payload' in raw
    );
  }

  async #registerUser(socket: Socket, jwtToken: unknown): Promise<void> {
    if (typeof jwtToken !== 'string' || jwtToken.length === DEFAULT_VALUE) {
      this.#logger.info(
        `Socket ${socket.id}: register_user rejected (no token)`
      );

      return;
    }

    try {
      const payload = await this.#token.verifyToken(jwtToken);
      const { userId } = payload;

      if (typeof userId !== 'string') {
        this.#logger.info(
          `Socket ${socket.id}: register_user rejected (invalid payload)`
        );

        return;
      }

      const user = await this.#userService.find(userId);
      const socketData = socket.data as SocketData;
      const previousProfileId = socketData.profileId;

      if (previousProfileId) {
        void socket.leave(userRoomId(previousProfileId));
      }

      socketData.profileId = user.profileId;
      await socket.join(userRoomId(user.profileId));
      this.#logger.info(
        `Socket ${socket.id} registered for profile ${user.profileId}`
      );
    } catch (error) {
      this.#logger.error(`Socket ${socket.id}: register_user failed`, {
        ...(error instanceof Error && { message: error.message })
      });
    }
  }

  #removeSocketFromCall(socket: Socket, chatId: string): void {
    const call = this.#callsByChatId.get(chatId);

    if (!call?.sockets.has(socket.id)) {
      return;
    }

    const leftProfileId = call.sockets.get(socket.id) ?? '';
    call.sockets.delete(socket.id);

    if (call.sockets.size === DEFAULT_VALUE) {
      this.#callsByChatId.delete(chatId);
      this.#io.to(chatId).emit(SocketEvents.CALL_ENDED, { chatId });

      return;
    }

    const participantProfileIds = this.#getParticipantProfileIds(call);
    const payload: CallUserLeftPayload = {
      chatId,
      leftProfileId,
      participantProfileIds
    };

    this.#io.to(chatId).emit(SocketEvents.CALL_USER_LEFT, payload);
    this.#io.to(chatId).emit(SocketEvents.CALL_STATE, {
      chatId,
      participantProfileIds
    });
  }

  #removeSocketFromRoom(socketId: string, chatId: string): void {
    this.#rooms.get(chatId)?.delete(socketId);

    if (this.#rooms.get(chatId)?.size === DEFAULT_VALUE) {
      this.#rooms.delete(chatId);
    }
  }
}

export { SocketModule, userRoomId };
