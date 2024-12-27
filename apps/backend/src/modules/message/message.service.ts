import { type User } from '../user/user.js';
import { MessageStatus, MessageType } from './libs/enums/enums.js';
import {
  type MessageCreationResponseDto,
  type MessageService,
  type TextMessageRequestDto
} from './libs/types/types.js';
import { type Message as MessageRepository } from './message.repository.js';

type Constructor = {
  messageRepository: MessageRepository;
};

class Message implements MessageService {
  #messageRepository: MessageRepository;

  public constructor({ messageRepository }: Constructor) {
    this.#messageRepository = messageRepository;
  }

  public async createText(
    user: User,
    data: TextMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto> {
    const { id: userId } = user;

    const text = data.content;

    return await this.#messageRepository.create({
      chatId,
      content: text,
      isPinned: false,
      senderId: userId,
      status: MessageStatus.SENT,
      type: MessageType.TEXT
    });
  }
}

export { Message };
