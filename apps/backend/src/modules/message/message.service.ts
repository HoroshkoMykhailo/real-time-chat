import { Types } from 'mongoose';
import { type Server } from 'socket.io';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import {
  getBlob,
  saveFile,
  savePicture,
  saveVideo
} from '~/libs/modules/helpers/helpers.js';
import { saveAudio } from '~/libs/modules/helpers/save-audio/save-audio.helper.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { SocketEvents } from '~/libs/modules/socket/socket.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type Chat as ChatRepository } from '../chat/chat.repository.js';
import { type ChatToUser as ChatToUserRepository } from '../chat-to-user/chat-to-user.repository.js';
import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { type TranscriptionService } from '../transcription/transcription.js';
import { type TranslationService } from '../translation/translation.js';
import { type User, UserRole } from '../user/user.js';
import { DEFAULT_LIMIT } from './libs/constants/default-limit.constant.js';
import { LIMIT_DIVISOR } from './libs/constants/limit-divisor.constant.js';
import {
  type MessageLanguage,
  MessageStatus,
  MessageType
} from './libs/enums/enums.js';
import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type MessageService,
  type TextMessageRequestDto,
  type TranslateMessageResponseDto
} from './libs/types/types.js';
import { type Message as MessageRepository } from './message.repository.js';

type IoGetter = () => Server;

type Constructor = {
  chatRepository: ChatRepository;
  chatToUserRepository: ChatToUserRepository;
  getIo: IoGetter;
  messageRepository: MessageRepository;
  profileRepository: ProfileRepository;
  transcriptionService: TranscriptionService;
  translationService: TranslationService;
};

class Message implements MessageService {
  #chatRepository: ChatRepository;
  #chatToUserRepository: ChatToUserRepository;
  #getIo: IoGetter;
  #isUserChatMember = async (user: User, chatId: string): Promise<boolean> => {
    const relation = await this.#chatToUserRepository.get(
      chatId,
      user.profileId
    );

    if (!relation) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    return true;
  };

  #messageRepository: MessageRepository;

  #profileRepository: ProfileRepository;

  #transcriptionService: TranscriptionService;

  #translationService: TranslationService;

  public constructor({
    chatRepository,
    chatToUserRepository,
    getIo,
    messageRepository,
    profileRepository,
    transcriptionService,
    translationService
  }: Constructor) {
    this.#chatRepository = chatRepository;
    this.#chatToUserRepository = chatToUserRepository;
    this.#getIo = getIo;
    this.#transcriptionService = transcriptionService;
    this.#messageRepository = messageRepository;
    this.#profileRepository = profileRepository;
    this.#translationService = translationService;
  }

  public async createAudio(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto> {
    const { profileId: userId } = user;

    const { file } = data;

    await this.#isUserChatMember(user, chatId);

    const senderProfile = await this.#profileRepository.getById(userId);

    if (!senderProfile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const fileUrl = await saveAudio(file);

    const message = await this.#messageRepository.create({
      chatId,
      content: '',
      fileUrl,
      isPinned: false,
      senderId: userId,
      status: MessageStatus.SENT,
      type: MessageType.AUDIO
    });

    await this.#chatRepository.setLastMessage(chatId, message.id);

    const io = this.#getIo();

    io.to(chatId).emit(SocketEvents.MESSAGE, {
      ...message,
      sender: senderProfile
    });

    return {
      ...message,
      sender: senderProfile
    };
  }

  public async createFile(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto> {
    const { profileId: userId } = user;

    const { file } = data;

    await this.#isUserChatMember(user, chatId);

    const senderProfile = await this.#profileRepository.getById(userId);

    if (!senderProfile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const fileUrl = await saveFile(file, file.mimetype, 'file-');

    const message = await this.#messageRepository.create({
      chatId,
      content: file.filename,
      fileUrl,
      isPinned: false,
      senderId: userId,
      status: MessageStatus.SENT,
      type: MessageType.FILE
    });

    await this.#chatRepository.setLastMessage(chatId, message.id);

    const io = this.#getIo();

    io.to(chatId).emit(SocketEvents.MESSAGE, {
      ...message,
      sender: senderProfile
    });

    return {
      ...message,
      sender: senderProfile
    };
  }

  public async createImage(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto> {
    const { profileId: userId } = user;

    const { file } = data;

    await this.#isUserChatMember(user, chatId);

    const senderProfile = await this.#profileRepository.getById(userId);

    if (!senderProfile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const fileUrl = await savePicture(file);

    const message = await this.#messageRepository.create({
      chatId,
      content: file.filename,
      fileUrl,
      isPinned: false,
      senderId: userId,
      status: MessageStatus.SENT,
      type: MessageType.IMAGE
    });

    await this.#chatRepository.setLastMessage(chatId, message.id);

    const io = this.#getIo();

    io.to(chatId).emit(SocketEvents.MESSAGE, {
      ...message,
      sender: senderProfile
    });

    return {
      ...message,
      sender: senderProfile
    };
  }

  public async createText(
    user: User,
    data: TextMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto> {
    const { profileId: userId } = user;

    const text = data.content;

    await this.#isUserChatMember(user, chatId);

    const senderProfile = await this.#profileRepository.getById(userId);

    if (!senderProfile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const message = await this.#messageRepository.create({
      chatId,
      content: text,
      isPinned: false,
      senderId: userId,
      status: MessageStatus.SENT,
      type: MessageType.TEXT
    });

    await this.#chatRepository.setLastMessage(chatId, message.id);

    const io = this.#getIo();

    io.to(chatId).emit(SocketEvents.MESSAGE, {
      ...message,
      sender: senderProfile
    });

    return {
      ...message,
      sender: senderProfile
    };
  }

  public async createVideo(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto> {
    const { profileId: userId } = user;

    const { file } = data;

    await this.#isUserChatMember(user, chatId);

    const senderProfile = await this.#profileRepository.getById(userId);

    if (!senderProfile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const fileUrl = await saveVideo(file);

    const message = await this.#messageRepository.create({
      chatId,
      content: file.filename,
      fileUrl,
      isPinned: false,
      senderId: userId,
      status: MessageStatus.SENT,
      type: MessageType.VIDEO
    });

    await this.#chatRepository.setLastMessage(chatId, message.id);

    const io = this.#getIo();

    io.to(chatId).emit(SocketEvents.MESSAGE, {
      ...message,
      sender: senderProfile
    });

    return {
      ...message,
      sender: senderProfile
    };
  }

  public async deleteMessage(user: User, messageId: string): Promise<boolean> {
    const message = await this.#messageRepository.getById(messageId);

    if (!message) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const chat = await this.#chatRepository.getById(message.chatId);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    if (
      message.senderId !== user.profileId &&
      user.role !== UserRole.ADMIN &&
      chat.adminId !== user.profileId
    ) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    const isDeleted = !!(await this.#messageRepository.deleteById(messageId));

    if (isDeleted) {
      const lastMessage = await this.#messageRepository.getLastMessage(chat.id);

      await this.#chatRepository.setLastMessage(
        chat.id,
        lastMessage?.id ?? null
      );
    }

    return isDeleted;
  }

  public async downloadFile(user: User, messageId: string): Promise<Blob> {
    const message = await this.#messageRepository.getById(messageId);

    if (!message) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    await this.#isUserChatMember(user, message.chatId);

    if (!message.fileUrl) {
      throw new HTTPError({
        message: ExceptionMessage.FILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return await getBlob(message.fileUrl);
  }

  public async getMessagesByChatId(
    user: User,
    chatId: string,
    query: {
      after?: string;
      before?: string;
      limit?: number;
    }
  ): Promise<GetMessagesResponseDto> {
    let { after, before, limit = DEFAULT_LIMIT } = query;

    if (!Types.ObjectId.isValid(chatId)) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CHAT_ID,
        status: HTTPCode.UNPROCESSED_ENTITY
      });
    }

    await this.#isUserChatMember(user, chatId);
    let lastViewedTime: null | string = null;

    if (!after && !before) {
      const relation = await this.#chatToUserRepository.get(
        chatId,
        user.profileId
      );

      if (!relation) {
        throw new HTTPError({
          message: ExceptionMessage.CHAT_NOT_FOUND,
          status: HTTPCode.NOT_FOUND
        });
      }

      lastViewedTime = relation.lastViewedAt;

      after = lastViewedTime;
      before = lastViewedTime;
      limit = DEFAULT_LIMIT * LIMIT_DIVISOR;
    }

    const messages = await this.#messageRepository.getMessagesByChatId({
      chatId,
      ...(after && { after }),
      ...(before && { before }),
      limit
    });

    return {
      ...(lastViewedTime && { lastViewedTime }),
      messages: await Promise.all(
        messages.map(async message => {
          const senderProfile = await this.#profileRepository.getById(
            message.senderId
          );

          if (!senderProfile) {
            throw new HTTPError({
              message: ExceptionMessage.PROFILE_NOT_FOUND,
              status: HTTPCode.NOT_FOUND
            });
          }

          return {
            ...message,
            sender: senderProfile
          };
        })
      )
    };
  }

  public async getPinMessagesByChatId(
    user: User,
    chatId: string
  ): Promise<GetMessagesResponseDto> {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CHAT_ID,
        status: HTTPCode.UNPROCESSED_ENTITY
      });
    }

    await this.#isUserChatMember(user, chatId);

    const messages =
      await this.#messageRepository.getPinnedMessagesByChatId(chatId);

    return {
      messages: await Promise.all(
        messages.map(async message => {
          const senderProfile = await this.#profileRepository.getById(
            message.senderId
          );

          if (!senderProfile) {
            throw new HTTPError({
              message: ExceptionMessage.PROFILE_NOT_FOUND,
              status: HTTPCode.NOT_FOUND
            });
          }

          return {
            ...message,
            sender: senderProfile
          };
        })
      )
    };
  }
  public async transcribeMessage(
    user: User,
    messageId: string
  ): Promise<MessageCreationResponseDto> {
    const message = await this.#messageRepository.getById(messageId);

    if (!message) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    if (message.type !== MessageType.AUDIO) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_MESSAGE_TYPE,
        status: HTTPCode.UNPROCESSED_ENTITY
      });
    }

    if (message.content) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_ALREADY_TRANSCRIBED,
        status: HTTPCode.UNPROCESSED_ENTITY
      });
    }

    await this.#isUserChatMember(user, message.chatId);

    if (!message.fileUrl) {
      throw new HTTPError({
        message: ExceptionMessage.FILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const transcribedMessage = await this.#transcriptionService.transcribe(
      message.fileUrl
    );

    const senderProfile = await this.#profileRepository.getById(
      message.senderId
    );

    if (!senderProfile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const updatedMessage = await this.#messageRepository.updateById(messageId, {
      content: transcribedMessage
    });

    if (!updatedMessage) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return {
      ...updatedMessage,
      sender: senderProfile
    };
  }

  public async translateMessage(
    user: User,
    messageId: string,
    language: ValueOf<typeof MessageLanguage>
  ): Promise<TranslateMessageResponseDto> {
    const message = await this.#messageRepository.getById(messageId);

    if (!message) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    await this.#isUserChatMember(user, message.chatId);

    const translatedMessage = await this.#translationService.translate(
      message.content,
      language
    );

    return {
      messageId: message.id,
      translatedMessage
    };
  }

  public async updatePin(user: User, messageId: string): Promise<boolean> {
    const message = await this.#messageRepository.getById(messageId);

    if (!message) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    await this.#isUserChatMember(user, message.chatId);

    const updatedMessage = await this.#messageRepository.updateById(messageId, {
      isPinned: !message.isPinned
    });

    return updatedMessage?.isPinned !== message.isPinned;
  }

  public async updateText(
    user: User,
    messageId: string,
    data: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto> {
    const message = await this.#messageRepository.getById(messageId);

    if (!message) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    if (message.senderId !== user.profileId) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    const sender = await this.#profileRepository.getById(user.profileId);

    if (!sender) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const text = data.content;

    const updatedMessage = await this.#messageRepository.updateById(messageId, {
      content: text
    });

    if (!updatedMessage) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return {
      ...updatedMessage,
      sender
    };
  }
}

export { Message };
