import { Types } from 'mongoose';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import {
  getBlob,
  saveFile,
  savePicture
} from '~/libs/modules/helpers/helpers.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { type Chat as ChatRepository } from '../chat/chat.repository.js';
import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { type User, UserRole } from '../user/user.js';
import { DEFAULT_LIMIT } from './libs/constants/default-limit.constant.js';
import { MessageStatus, MessageType } from './libs/enums/enums.js';
import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type MessageService,
  type TextMessageRequestDto
} from './libs/types/types.js';
import { type Message as MessageRepository } from './message.repository.js';

type Constructor = {
  chatRepository: ChatRepository;
  messageRepository: MessageRepository;
  profileRepository: ProfileRepository;
};

class Message implements MessageService {
  #chatRepository: ChatRepository;

  #isUserChatMember = async (user: User, chatId: string): Promise<boolean> => {
    const chat = await this.#chatRepository.getById(chatId);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return chat.members.includes(user.profileId);
  };

  #messageRepository: MessageRepository;

  #profileRepository: ProfileRepository;

  public constructor({
    chatRepository,
    messageRepository,
    profileRepository
  }: Constructor) {
    this.#chatRepository = chatRepository;
    this.#messageRepository = messageRepository;
    this.#profileRepository = profileRepository;
  }

  public async createFile(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto> {
    const { profileId: userId } = user;

    const { file } = data;

    const isMember = await this.#isUserChatMember(user, chatId);

    if (!isMember) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

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

    const isMember = await this.#isUserChatMember(user, chatId);

    if (!isMember) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

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
      content: fileUrl,
      isPinned: false,
      senderId: userId,
      status: MessageStatus.SENT,
      type: MessageType.IMAGE
    });

    await this.#chatRepository.setLastMessage(chatId, message.id);

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

    const isMember = await this.#isUserChatMember(user, chatId);

    if (!isMember) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

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

    const isMember = await this.#isUserChatMember(user, message.chatId);

    if (!isMember) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

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
    const { after, before, limit = DEFAULT_LIMIT } = query;

    if (!Types.ObjectId.isValid(chatId)) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CHAT_ID,
        status: HTTPCode.UNPROCESSED_ENTITY
      });
    }

    const isMember = await this.#isUserChatMember(user, chatId);

    if (!isMember) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    const messages = await this.#messageRepository.getMessagesByChatId({
      chatId,
      ...(after && { after }),
      ...(before && { before }),
      ...(limit && { limit })
    });

    return await Promise.all(
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
    );
  }

  public async updatePin(user: User, messageId: string): Promise<boolean> {
    const message = await this.#messageRepository.getById(messageId);

    if (!message) {
      throw new HTTPError({
        message: ExceptionMessage.MESSAGE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const isMember = await this.#isUserChatMember(user, message.chatId);

    if (!isMember) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    const updatedMessage = await this.#messageRepository.updateById(messageId, {
      isPinned: !message.isPinned
    });

    return !!updatedMessage;
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
