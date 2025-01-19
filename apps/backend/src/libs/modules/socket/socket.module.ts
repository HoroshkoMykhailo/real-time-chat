import { type Server as IOServer, type Socket } from 'socket.io';

import { type LoggerModule } from '../logger/logger.js';
import { SocketEvents } from './socket.js';

const DEFAULT_VALUE = 0;

type Constructor = {
  io: IOServer;
  logger: LoggerModule;
};

class SocketModule {
  #io: IOServer;
  #logger: LoggerModule;
  #rooms: Map<string, Set<string>>;

  public constructor({ io, logger }: Constructor) {
    this.#io = io;
    this.#logger = logger;
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

  #removeSocketFromRoom(socketId: string, chatId: string): void {
    this.#rooms.get(chatId)?.delete(socketId);

    if (this.#rooms.get(chatId)?.size === DEFAULT_VALUE) {
      this.#rooms.delete(chatId);
    }
  }
}

export { SocketModule };
