import { ExceptionMessage } from '~/libs/enums/enums.js';
import { savePicture } from '~/libs/modules/helpers/helpers.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { type Message as MessageRepository } from '../message/message.repository.js';
import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { type User, UserRole } from '../user/user.js';
import { type Chat as ChatRepository } from './chat.repository.js';
import { ChatType, ChatValidationRule } from './libs/enums/enums.js';
import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatService,
  type ChatsResponseDto,
  type Chat as TChat
} from './libs/types/types.js';

const DEFAULT_VALUE = 0;

type Constructor = {
  chatRepository: ChatRepository;
  messageRepository: MessageRepository;
  profileRepository: ProfileRepository;
};

class Chat implements ChatService {
  #chatRepository: ChatRepository;
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

  async #formatChat(
    chat: TChat,
    userId: string
  ): Promise<ChatsResponseDto[typeof DEFAULT_VALUE]> {
    const lastMessage = await this.#getLastMessage(chat);
    const { chatPicture, name } = await this.#getChatMetadata(chat, userId);

    return {
      id: chat.id,
      name,
      type: chat.type,
      ...(lastMessage && { lastMessage }),
      ...(chatPicture && { groupPicture: chatPicture })
    };
  }

  async #getChatMetadata(
    chat: TChat,
    userId: string
  ): Promise<{ chatPicture?: string; name: string }> {
    if (chat.type === ChatType.PRIVATE) {
      const partnerId = chat.members.find(memberId => memberId !== userId);

      if (!partnerId) {
        throw new HTTPError({
          message: ExceptionMessage.MEMBER_NOT_FOUND,
          status: HTTPCode.NOT_FOUND
        });
      }

      const partnerProfile = await this.#profileRepository.getById(partnerId);

      if (!partnerProfile) {
        throw new HTTPError({
          message: ExceptionMessage.MEMBER_NOT_FOUND,
          status: HTTPCode.NOT_FOUND
        });
      }

      return {
        name: partnerProfile.username,
        ...(partnerProfile.profilePicture && {
          chatPicture: partnerProfile.profilePicture
        })
      };
    }

    return {
      name: chat.name ?? '',
      ...(chat.groupPicture && { chatPicture: chat.groupPicture })
    };
  }

  async #getLastMessage(
    chat: TChat
  ): Promise<
    ChatsResponseDto[typeof DEFAULT_VALUE]['lastMessage'] | undefined
  > {
    if (!chat.lastMessageId) {
      return undefined;
    }

    const message = await this.#messageRepository.getById(chat.lastMessageId);

    if (!message) {
      return undefined;
    }

    const lastMessage = {
      content: message.content,
      createdAt: message.createdAt,
      senderName: ''
    };

    if (chat.type === ChatType.GROUP) {
      const senderProfile = await this.#profileRepository.getById(
        message.senderId
      );
      lastMessage.senderName = senderProfile?.username ?? '';
    }

    return lastMessage;
  }

  public async addMembers(
    id: string,
    user: User,
    members: string[]
  ): Promise<ChatGetResponseDto> {
    const chat = await this.#chatRepository.getById(id);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    if (chat.type === ChatType.PRIVATE) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_IS_PRIVATE,
        status: HTTPCode.FORBIDDEN
      });
    }

    const isUserMember = chat.members.includes(user.profileId);

    if (!isUserMember) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_IN_CHAT,
        status: HTTPCode.FORBIDDEN
      });
    }

    const newMembers = members.filter(member => !chat.members.includes(member));

    if (newMembers.length !== members.length) {
      throw new HTTPError({
        message: ExceptionMessage.USER_ALREADY_IN_CHAT,
        status: HTTPCode.BAD_REQUEST
      });
    }

    const memberProfiles =
      await this.#profileRepository.getProfilesByIds(newMembers);

    if (memberProfiles.length !== newMembers.length) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const updatedMembers = [...chat.members, ...newMembers];

    await this.#chatRepository.updateById(chat.id, { members: updatedMembers });

    const profiles =
      await this.#profileRepository.getProfilesByIds(updatedMembers);

    return {
      members: profiles,
      ...(chat.adminId && { adminId: chat.adminId })
    };
  }
  public async create(
    user: User,
    data: ChatCreationRequestDto
  ): Promise<ChatCreationResponseDto> {
    const { profileId: adminId } = user;
    const { groupPicture, members, name, type } = data;

    const adminProfile = await this.#profileRepository.getById(adminId);

    if (!adminProfile) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    if (!name && type.value === ChatType.GROUP) {
      throw new HTTPError({
        message: ExceptionMessage.GROUP_NAME_REQUIRED,
        status: HTTPCode.BAD_REQUEST
      });
    }

    if (
      type.value === ChatType.PRIVATE &&
      members.length !== ChatValidationRule.PRIVATE_MEMBERS_COUNT
    ) {
      throw new HTTPError({
        message: ExceptionMessage.NOT_VALID_MEMBERS_COUNT,
        status: HTTPCode.NOT_FOUND
      });
    }

    const memberProfiles = await Promise.all(
      members.map(async member => {
        const profile = await this.#profileRepository.getById(member.value);

        if (!profile) {
          throw new HTTPError({
            message: ExceptionMessage.MEMBER_NOT_FOUND,
            status: HTTPCode.NOT_FOUND
          });
        }

        return profile;
      })
    );

    let groupPicturePath: string | undefined;

    if (groupPicture) {
      groupPicturePath = await savePicture(groupPicture);
    }

    const chatCreation: Omit<TChat, 'createdAt' | 'id' | 'updatedAt'> = {
      members: members.map(member => member.value),
      type: type.value
    };

    if (type.value === ChatType.GROUP) {
      chatCreation.adminId = adminId;
    }

    if (groupPicturePath) {
      chatCreation.groupPicture = groupPicturePath;
    }

    if (name) {
      chatCreation.name = name.value;
    }

    const createdChat = await this.#chatRepository.create(chatCreation);

    const response: ChatCreationResponseDto = {
      createdAt: createdChat.createdAt,
      id: createdChat.id,
      members: memberProfiles,
      type: createdChat.type,
      updatedAt: createdChat.updatedAt,
      ...(groupPicturePath && { groupPicture: groupPicturePath }),
      ...(name && { name: name.value }),
      ...(type.value === ChatType.GROUP && {
        admin: { id: adminId, profile: adminProfile }
      })
    };

    return response;
  }

  public async getChat(id: string, user: User): Promise<ChatGetResponseDto> {
    const chat = await this.#chatRepository.getById(id);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const isUserMember = chat.members.includes(user.profileId);

    if (!isUserMember) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_IN_CHAT,
        status: HTTPCode.FORBIDDEN
      });
    }

    const profiles = await this.#profileRepository.getProfilesByIds(
      chat.members
    );

    return {
      members: profiles,
      ...(chat.adminId && { adminId: chat.adminId })
    };
  }

  public async getMyChats(user: User): Promise<ChatsResponseDto> {
    const { profileId: userId } = user;

    const chats = await this.#chatRepository.getByProfileId(userId);

    return await Promise.all(chats.map(chat => this.#formatChat(chat, userId)));
  }

  public async leaveChat(
    id: string,
    user: User
  ): Promise<ChatGetResponseDto | null> {
    const chat = await this.#chatRepository.getById(id);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const isUserMember = chat.members.includes(user.profileId);

    if (!isUserMember) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_IN_CHAT,
        status: HTTPCode.FORBIDDEN
      });
    }

    chat.members = chat.members.filter(member => member !== user.profileId);

    if (chat.type === ChatType.PRIVATE) {
      await this.#messageRepository.deleteByChatId(id);
      await this.#chatRepository.deleteById(id);

      return null;
    }

    if (chat.adminId === user.profileId) {
      if (chat.members.length === DEFAULT_VALUE) {
        await this.#messageRepository.deleteByChatId(id);
        await this.#chatRepository.deleteById(id);

        return null;
      }

      if (chat.members[DEFAULT_VALUE]) {
        [chat.adminId] = chat.members;
      }
    }

    await this.#chatRepository.updateById(id, chat);

    const profiles = await this.#profileRepository.getProfilesByIds(
      chat.members
    );

    return {
      members: profiles,
      ...(chat.adminId && { adminId: chat.adminId })
    };
  }

  public async removeMember(
    id: string,
    user: User,
    member: string
  ): Promise<ChatGetResponseDto> {
    const chat = await this.#chatRepository.getById(id);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    if (user.profileId === member) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    if (chat.type === ChatType.PRIVATE) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_IS_PRIVATE,
        status: HTTPCode.FORBIDDEN
      });
    }

    if (chat.adminId !== user.profileId && user.role !== UserRole.ADMIN) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    const isMember = chat.members.includes(member);

    if (!isMember) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_IN_CHAT,
        status: HTTPCode.CONFLICT
      });
    }

    chat.members = chat.members.filter(memberId => memberId !== member);
    await this.#chatRepository.updateById(id, chat);

    const profiles = await this.#profileRepository.getProfilesByIds(
      chat.members
    );

    return {
      members: profiles,
      ...(chat.adminId && { adminId: chat.adminId })
    };
  }
}

export { Chat };