import { ExceptionMessage } from '~/libs/enums/enums.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { deleteStoredUserMedia } from '~/libs/modules/storage/storage.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type Chat as ChatRepository } from '../chat/chat.repository.js';
import { type ChatService } from '../chat/libs/types/chat-service.type.js';
import {
  type ChatGetResponseDto,
  type ChatsResponseDto
} from '../chat/libs/types/types.js';
import { type MessageService } from '../message/libs/types/message-service.type.js';
import { type GetMessagesResponseDto } from '../message/libs/types/types.js';
import { type Message as MessageRepository } from '../message/message.repository.js';
import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { type UserRole } from '../user/libs/enums/enums.js';
import {
  type User as TUser,
  type UserProfileCreationResponseDto
} from '../user/libs/types/types.js';
import { type UserRepository } from '../user/libs/types/user-repository.type.js';

type AdminUserDetailDto = {
  profile: UserProfileCreationResponseDto;
  user: TUser;
};

type AdminUserSummaryDto = {
  createdAt: string;
  email: string;
  id: string;
  profilePicture?: string;
  role: ValueOf<typeof UserRole>;
  username: string;
};

type Constructor = {
  chatRepository: ChatRepository;
  chatService: ChatService;
  messageRepository: MessageRepository;
  messageService: MessageService;
  profileRepository: ProfileRepository;
  userRepository: UserRepository;
};

class AdminService {
  #chatRepository: ChatRepository;

  #chatService: ChatService;

  #messageRepository: MessageRepository;

  #messageService: MessageService;

  #profileRepository: ProfileRepository;

  #userRepository: UserRepository;

  public constructor({
    chatRepository,
    chatService,
    messageRepository,
    messageService,
    profileRepository,
    userRepository
  }: Constructor) {
    this.#chatRepository = chatRepository;
    this.#chatService = chatService;
    this.#messageService = messageService;
    this.#messageRepository = messageRepository;
    this.#profileRepository = profileRepository;
    this.#userRepository = userRepository;
  }

  public async deleteUser(
    admin: TUser,
    targetUserId: string
  ): Promise<{ deleted: true }> {
    if (admin.id === targetUserId) {
      throw new HTTPError({
        message: ExceptionMessage.CANNOT_DELETE_OWN_ACCOUNT,
        status: HTTPCode.FORBIDDEN
      });
    }

    const user = await this.#userRepository.getById(targetUserId);

    if (!user) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const { profileId } = user;

    await this.#chatService.purgeUserMembership(profileId);

    const chatIds =
      await this.#messageRepository.getDistinctChatIdsBySenderId(profileId);

    await this.#messageRepository.deleteManyBySenderId(profileId);

    for (const chatId of chatIds) {
      const lastMessage = await this.#messageRepository.getLastMessage(chatId);

      await this.#chatRepository.setLastMessage(
        chatId,
        lastMessage?.id ?? null
      );
    }

    const profile = await this.#profileRepository.getById(profileId);

    if (profile?.profilePicture) {
      void deleteStoredUserMedia(profile.profilePicture).catch(() => {});
    }

    await this.#profileRepository.deleteById(profileId);
    await this.#userRepository.deleteById(targetUserId);

    return { deleted: true };
  }

  public async getMonitoringChat(chatId: string): Promise<ChatGetResponseDto> {
    return await this.#chatService.getChatForAdmin(chatId);
  }

  public async getMonitoringMessages(
    chatId: string,
    query: {
      after?: string;
      before?: string;
      limit?: number;
    }
  ): Promise<GetMessagesResponseDto> {
    return await this.#messageService.getMessagesByChatIdForAdmin(
      chatId,
      query
    );
  }

  public async getUserDetail(userId: string): Promise<AdminUserDetailDto> {
    const user = await this.#userRepository.getById(userId);

    if (!user) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const profile = await this.#profileRepository.getById(user.profileId);

    if (!profile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return { profile, user };
  }

  public async listChatsForMonitoring(): Promise<ChatsResponseDto> {
    return await this.#chatService.listAllChatsForAdmin();
  }

  public async listUsers(): Promise<AdminUserSummaryDto[]> {
    const users = await this.#userRepository.getAll();
    const summaries = await Promise.all(
      users.map(async (user: TUser) => {
        const profile = await this.#profileRepository.getById(user.profileId);

        return {
          createdAt: user.createdAt,
          email: user.email,
          id: user.id,
          role: user.role,
          username: profile?.username ?? '',
          ...(profile?.profilePicture && {
            profilePicture: profile.profilePicture
          })
        };
      })
    );

    return summaries.toSorted(
      (a: AdminUserSummaryDto, b: AdminUserSummaryDto) =>
        a.username.localeCompare(b.username, 'uk')
    );
  }

  public async updateUser(
    targetUserId: string,
    payload: {
      email?: string;
      role?: ValueOf<typeof UserRole>;
      username?: string;
    }
  ): Promise<AdminUserDetailDto> {
    const user = await this.#userRepository.getById(targetUserId);

    if (!user) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    if (payload.email !== undefined && payload.email !== user.email) {
      const existing = await this.#userRepository.getByEmail(payload.email);

      if (existing && existing._id.toString() !== targetUserId) {
        throw new HTTPError({
          message: ExceptionMessage.EMAIL_USED,
          status: HTTPCode.CONFLICT
        });
      }
    }

    if (payload.email !== undefined || payload.role !== undefined) {
      await this.#userRepository.updatePartialById(targetUserId, {
        ...(payload.email !== undefined && { email: payload.email }),
        ...(payload.role !== undefined && { role: payload.role })
      });
    }

    if (payload.username !== undefined) {
      const profile = await this.#profileRepository.getById(user.profileId);

      if (!profile) {
        throw new HTTPError({
          message: ExceptionMessage.PROFILE_NOT_FOUND,
          status: HTTPCode.NOT_FOUND
        });
      }

      profile.username = payload.username;
      await this.#profileRepository.updateById(user.profileId, profile);
    }

    const updatedUser = await this.#userRepository.getById(targetUserId);

    if (!updatedUser) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const profile = await this.#profileRepository.getById(
      updatedUser.profileId
    );

    if (!profile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return { profile, user: updatedUser };
  }
}

export { AdminService, type AdminUserDetailDto, type AdminUserSummaryDto };
