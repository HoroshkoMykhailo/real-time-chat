import { ChatModel } from '../chat/chat.model.js';
import { Chat as ChatRepository } from '../chat/chat.repository.js';
import { MessageModel } from '../message/message.model.js';
import { Message as MessageRepository } from '../message/message.repository.js';
import { ProfileModel } from '../profile/profile.model.js';
import { Profile as ProfileRepository } from '../profile/profile.repository.js';
import { UserModel } from '../user/user.model.js';
import { User as UserRepository } from '../user/user.repository.js';

const chatRepository = new ChatRepository({
  chatModel: ChatModel
});

const messageRepository = new MessageRepository({
  messageModel: MessageModel
});

const profileRepository = new ProfileRepository({
  profileModel: ProfileModel
});

const userRepository = new UserRepository({
  userModel: UserModel
});

export { chatRepository, messageRepository, profileRepository, userRepository };
