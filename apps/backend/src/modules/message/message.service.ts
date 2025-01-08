import { Types } from 'mongoose';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { type Chat as ChatRepository } from '../chat/chat.repository.js';
import { type User } from '../user/user.js';
import { DEFAULT_LIMIT } from './libs/constants/default-limit.constant.js';
import { MessageStatus, MessageType } from './libs/enums/enums.js';
import {
  type MessageCreationResponseDto,
  type MessageService,
  type Message as TMessage,
  type TextMessageRequestDto
} from './libs/types/types.js';
import { type Message as MessageRepository } from './message.repository.js';

type Constructor = {
  chatRepository: ChatRepository;
  messageRepository: MessageRepository;
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

  public constructor({ chatRepository, messageRepository }: Constructor) {
    this.#chatRepository = chatRepository;
    this.#messageRepository = messageRepository;
  }

  public async createText(
    user: User,
    data: TextMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto> {
    const { profileId: userId } = user;

    const text = data.content;

    const message = await this.#messageRepository.create({
      chatId,
      content: text,
      isPinned: false,
      senderId: userId,
      status: MessageStatus.SENT,
      type: MessageType.TEXT
    });

    await this.#chatRepository.setLastMessage(chatId, message.id);

    return message;
  }

  public async getMessagesByChatId(
    user: User,
    chatId: string,
    query: {
      after?: string;
      before?: string;
      limit?: number;
    }
  ): Promise<TMessage[]> {
    const { after, before, limit = DEFAULT_LIMIT } = query;

    if (!Types.ObjectId.isValid(chatId)) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CHAT_ID,
        status: HTTPCode.UNPROCESSED_ENTITY
      });
    }

    const chat = await this.#chatRepository.getById(chatId);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const isMember = await this.#isUserChatMember(user, chatId);

    if (!isMember) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    return await this.#messageRepository.getMessagesByChatId({
      chatId,
      ...(after && { after }),
      ...(before && { before }),
      ...(limit && { limit })
    });
  }
}

export { Message };
