import { type Chat as ChatRepository } from '../chat/chat.repository.js';
import { type User } from '../user/user.js';
import { MessageStatus, MessageType } from './libs/enums/enums.js';
import {
  type MessageCreationResponseDto,
  type MessageService,
  type TextMessageRequestDto
} from './libs/types/types.js';
import { type Message as MessageRepository } from './message.repository.js';

type Constructor = {
  chatRepository: ChatRepository;
  messageRepository: MessageRepository;
};

class Message implements MessageService {
  #chatRepository: ChatRepository;
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
    const { id: userId } = user;

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
}

export { Message };
