import { type Server } from 'socket.io';

class SocketManager {
  private _io: Server | null = null;
  private static instance: SocketManager;

  private constructor() {}

  public static getInstance(): SocketManager {
    SocketManager.instance = new SocketManager();

    return SocketManager.instance;
  }

  public getIo(): Server {
    if (!this._io) {
      throw new Error('Socket.IO not initialized');
    }

    return this._io;
  }

  public setIo(io: Server): void {
    this._io = io;
  }
}

export { SocketManager };
