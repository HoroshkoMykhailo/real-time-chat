import { type Server as IOServer, type Socket } from 'socket.io';

import { type UserService } from '~/modules/user/user.js';

import { type LoggerModule } from '../logger/logger.js';
import { type Token } from '../token/token.js';
import { SocketEvents } from './socket.js';

const DEFAULT_VALUE = 0;

const userRoomId = (profileId: string): string => `user:${profileId}`;

type Constructor = {
  io: IOServer;
  logger: LoggerModule;
  token: Token;
  userService: UserService;
};

type SocketData = {
  profileId?: string;
};

class SocketModule {
  #io: IOServer;
  #logger: LoggerModule;
  #rooms: Map<string, Set<string>>;
  #token: Token;
  #userService: UserService;

  public constructor({ io, logger, token, userService }: Constructor) {
    this.#io = io;
    this.#logger = logger;
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

      socket.on(SocketEvents.DISCONNECT, () => {
        this.#logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  #isSocketInRoom(socketId: string, chatId: string): boolean {
    return this.#rooms.has(chatId) && !!this.#rooms.get(chatId)?.has(socketId);
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

  #removeSocketFromRoom(socketId: string, chatId: string): void {
    this.#rooms.get(chatId)?.delete(socketId);

    if (this.#rooms.get(chatId)?.size === DEFAULT_VALUE) {
      this.#rooms.delete(chatId);
    }
  }
}

export { SocketModule, userRoomId };
