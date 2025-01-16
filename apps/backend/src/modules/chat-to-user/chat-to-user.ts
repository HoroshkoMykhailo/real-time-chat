import { ChatToUserModel } from './chat-to-user.model.js';
import { ChatToUser as ChatToUserRepository } from './chat-to-user.repository.js';

const chatToUserRepository = new ChatToUserRepository(ChatToUserModel);

export { chatToUserRepository };
