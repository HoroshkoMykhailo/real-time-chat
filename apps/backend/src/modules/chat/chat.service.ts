import { ExceptionMessage } from '~/libs/enums/enums.js';
import { savePicture } from '~/libs/modules/helpers/helpers.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type Message as MessageRepository } from '../message/message.repository.js';
import { type Profile } from '../profile/libs/types/types.js';
import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { type User, UserRole } from '../user/user.js';
import { type Chat as ChatRepository } from './chat.repository.js';
import { ChatType, ChatValidationRule } from './libs/enums/enums.js';
import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatService,
  type ChatUpdateRequestDto,
  type ChatUpdateResponseDto,
  type ChatsResponseDto,
  type Chat as TChat
} from './libs/types/types.js';

const DEFAULT_VALUE = 0;
const NEGATIVE_VALUE = -1;
const POSITIVE_VALUE = 1;

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

  async #checkChatExists(chatId: string): Promise<TChat> {
    const chat = await this.#chatRepository.getById(chatId);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return chat;
  }

  async #fetchMemberProfiles(members: { value: string }[]): Promise<Profile[]> {
    return await Promise.all(
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
  }

  async #formatChat(
    chat: TChat,
    userId: string
  ): Promise<ChatsResponseDto[number]> {
    const lastMessage = await this.#getLastMessage(chat);
    const { chatPicture, name } = await this.#getChatMetadata(chat, userId);

    return {
      id: chat.id,
      name,
      type: chat.type,
      ...(chat.type === ChatType.GROUP && { memberCount: chat.members.length }),
      ...(lastMessage && { lastMessage }),
      ...(chatPicture && { chatPicture })
    };
  }

  #formatChatResponse({
    adminId,
    chat,
    memberProfiles,
    type
  }: {
    adminId: string;
    chat: TChat;
    memberProfiles: Profile[];
    type: ValueOf<typeof ChatType>;
  }): ChatCreationResponseDto {
    let chatName = chat.name ?? '';

    if (type === ChatType.PRIVATE) {
      const otherMember = memberProfiles.find(member => member.id !== adminId);

      if (otherMember) {
        chatName = otherMember.username;

        if (otherMember.profilePicture) {
          chat.groupPicture = otherMember.profilePicture;
        }
      }
    }

    return {
      id: chat.id,
      members: memberProfiles,
      type: chat.type,
      ...(chat.groupPicture && { chatPicture: chat.groupPicture }),
      name: chatName,
      ...(type === ChatType.GROUP && { adminId })
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
  ): Promise<ChatsResponseDto[number]['lastMessage'] | undefined> {
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

  async #handleExistingPrivateChat(
    adminId: string,
    members: { value: string }[]
  ): Promise<ChatCreationResponseDto | null> {
    const memberIds = members
      .map(member => member.value)
      .sort((a, b) => a.localeCompare(b));
    const existingChat =
      await this.#chatRepository.findPrivateChatByMembers(memberIds);

    if (!existingChat) {
      return null;
    }

    const existingMemberProfiles = await this.#fetchMemberProfiles(members);

    return this.#formatChatResponse({
      adminId,
      chat: existingChat,
      memberProfiles: existingMemberProfiles,
      type: ChatType.PRIVATE
    });
  }

  async #validateAdminProfile(adminId: string): Promise<Profile> {
    const adminProfile = await this.#profileRepository.getById(adminId);

    if (!adminProfile) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return adminProfile;
  }
  #validateMembers(
    adminId: string,
    members: { value: string }[],
    type: { value: ValueOf<typeof ChatType> }
  ): void {
    if (!members.some(member => member.value === adminId)) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
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
  }

  public async addMembers(
    id: string,
    user: User,
    members: string[]
  ): Promise<ChatGetResponseDto> {
    const chat = await this.#checkChatExists(id);

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

    await this.#validateAdminProfile(adminId);

    this.#validateMembers(adminId, members, type);

    if (type.value === ChatType.PRIVATE) {
      const existingChat = await this.#handleExistingPrivateChat(
        adminId,
        members
      );

      if (existingChat) {
        return existingChat;
      }
    }

    if (!name && type.value === ChatType.GROUP) {
      throw new HTTPError({
        message: ExceptionMessage.GROUP_NAME_REQUIRED,
        status: HTTPCode.BAD_REQUEST
      });
    }

    const memberProfiles = await this.#fetchMemberProfiles(members);

    const chatCreation: Omit<TChat, 'createdAt' | 'id' | 'updatedAt'> = {
      members: members.map(member => member.value),
      type: type.value
    };

    if (groupPicture) {
      chatCreation.groupPicture = await savePicture(groupPicture);
    }

    if (type.value === ChatType.GROUP) {
      chatCreation.adminId = adminId;
    }

    if (name) {
      chatCreation.name = name.value;
    }

    const createdChat = await this.#chatRepository.create(chatCreation);

    return this.#formatChatResponse({
      adminId,
      chat: createdChat,
      memberProfiles,
      type: type.value
    });
  }

  public async deleteChat(id: string, user: User): Promise<boolean> {
    const chat = await this.#checkChatExists(id);

    if (chat.type === ChatType.PRIVATE) {
      await this.#messageRepository.deleteByChatId(id);

      return !!(await this.#chatRepository.deleteById(id));
    }

    if (chat.adminId !== user.profileId && user.role !== UserRole.ADMIN) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    await this.#messageRepository.deleteByChatId(id);

    return !!(await this.#chatRepository.deleteById(id));
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

    const formattedChats = await Promise.all(
      chats.map(chat => this.#formatChat(chat, userId))
    );

    return formattedChats.sort((a, b) => {
      const lastMessageA = a.lastMessage?.createdAt;
      const lastMessageB = b.lastMessage?.createdAt;

      if (!lastMessageA) {
        return POSITIVE_VALUE;
      }

      if (!lastMessageB) {
        return NEGATIVE_VALUE;
      }

      return (
        new Date(lastMessageB).getTime() - new Date(lastMessageA).getTime()
      );
    });
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
    const chat = await this.#checkChatExists(id);

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

  public async updateChat(
    id: string,
    user: User,
    data: ChatUpdateRequestDto
  ): Promise<ChatUpdateResponseDto> {
    const chat = await this.#checkChatExists(id);

    const { groupPicture, name } = data;

    if (user.profileId !== chat.adminId && user.role !== UserRole.ADMIN) {
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

    if (name?.value) {
      chat.name = name.value;
    }

    if (groupPicture) {
      chat.groupPicture = await savePicture(groupPicture);
    }

    const updatedChat = await this.#chatRepository.updateById(id, chat);

    if (!updatedChat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const response: ChatUpdateResponseDto = {
      createdAt: updatedChat.createdAt,
      id: updatedChat.id,
      type: updatedChat.type,
      updatedAt: updatedChat.updatedAt,
      ...(groupPicture && { chatPicture: updatedChat.groupPicture }),
      ...(name && { name: name.value })
    };

    return response;
  }
}

export { Chat };
