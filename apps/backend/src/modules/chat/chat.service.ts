import { type Server } from 'socket.io';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { savePicture } from '~/libs/modules/helpers/helpers.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { type LoggerModule } from '~/libs/modules/logger/logger.js';
import { SocketEvents, userRoomId } from '~/libs/modules/socket/socket.js';
import { deleteStoredUserMedia } from '~/libs/modules/storage/storage.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type ChatToUser as ChatToUserRepository } from '../chat-to-user/chat-to-user.repository.js';
import { type Message as MessageRepository } from '../message/message.repository.js';
import { type Profile } from '../profile/libs/types/types.js';
import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { MAX_MESSAGES_FOR_SUMMARY } from '../summary/libs/constants/constants.js';
import { type SummaryService } from '../summary/summary.js';
import { type User, UserRole } from '../user/user.js';
import { type Chat as ChatRepository } from './chat.repository.js';
import { ChatType, ChatValidationRule } from './libs/enums/enums.js';
import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatService,
  type ChatsResponseDto,
  type ChatSummaryRequestDto,
  type ChatSummaryResponseDto,
  type ChatUpdateRequestDto,
  type ChatUpdateResponseDto,
  type Chat as TChat,
  type UpdateLastViewedTimeResponseDto
} from './libs/types/types.js';

/** MongoDB batch $in limit guard — avoids oversized queries from pathological payloads. */
const MAX_CHAT_IDS_PER_QUERY = 500;

/** Upper bound for group size (defense in depth beyond Joi minimum). */
const MAX_GROUP_CHAT_MEMBERS = 100;

const EMPTY_LENGTH = 0;

const SORT_EQUAL = 0;
const SORT_A_AFTER_B = 1;
const SORT_A_BEFORE_B = -1;
const INITIAL_UNREAD_COUNT = 0;

type Constructor = {
  chatRepository: ChatRepository;
  chatToUserRepository: ChatToUserRepository;
  getIo: IoGetter;
  logger: LoggerModule;
  messageRepository: MessageRepository;
  profileRepository: ProfileRepository;
  summaryService: SummaryService;
};

type IoGetter = () => Server;

const compareChatsByLastMessageDesc = (
  a: ChatsResponseDto[number],
  b: ChatsResponseDto[number]
): number => {
  const timeA = a.lastMessage?.createdAt;
  const timeB = b.lastMessage?.createdAt;

  if (!timeA && !timeB) {
    return SORT_EQUAL;
  }

  if (!timeA) {
    return SORT_A_AFTER_B;
  }

  if (!timeB) {
    return SORT_A_BEFORE_B;
  }

  return new Date(timeB).getTime() - new Date(timeA).getTime();
};

class Chat implements ChatService {
  #chatRepository: ChatRepository;
  #chatToUserRepository: ChatToUserRepository;
  #getIo: IoGetter;
  #logger: LoggerModule;
  #messageRepository: MessageRepository;
  #profileRepository: ProfileRepository;
  #summaryService: SummaryService;

  public constructor({
    chatRepository,
    chatToUserRepository,
    getIo,
    logger,
    messageRepository,
    profileRepository,
    summaryService
  }: Constructor) {
    this.#chatToUserRepository = chatToUserRepository;
    this.#chatRepository = chatRepository;
    this.#getIo = getIo;
    this.#logger = logger;
    this.#messageRepository = messageRepository;
    this.#profileRepository = profileRepository;
    this.#summaryService = summaryService;
  }

  public async addMembers(
    id: string,
    user: User,
    members: string[]
  ): Promise<ChatGetResponseDto> {
    try {
      if (!Array.isArray(members) || members.length === EMPTY_LENGTH) {
        throw new HTTPError({
          message: ExceptionMessage.NOT_VALID_MEMBERS_COUNT,
          status: HTTPCode.BAD_REQUEST
        });
      }

      const chat = await this.#requireExistingChat(id);

      if (chat.type === ChatType.PRIVATE) {
        throw new HTTPError({
          message: ExceptionMessage.CHAT_IS_PRIVATE,
          status: HTTPCode.FORBIDDEN
        });
      }

      this.#requireChatMember(chat, user.profileId);

      const newMembers = members.filter(
        member => !chat.members.includes(member)
      );

      if (newMembers.length !== members.length) {
        throw new HTTPError({
          message: ExceptionMessage.USER_ALREADY_IN_CHAT,
          status: HTTPCode.BAD_REQUEST
        });
      }

      await this.#requireProfilesInMemberOrder(newMembers);

      const updatedMembers = [...chat.members, ...newMembers];

      await this.#chatRepository.updateById(chat.id, {
        members: updatedMembers
      });

      const profiles = await this.#requireProfilesInMemberOrder(updatedMembers);

      await this.#createChatToUserRecords(id, newMembers);

      return {
        members: profiles,
        ...(chat.adminId && { adminId: chat.adminId })
      };
    } catch (error) {
      this.#fail('addMembers', error);
    }
  }

  public async create(
    user: User,
    data: ChatCreationRequestDto
  ): Promise<ChatCreationResponseDto> {
    try {
      const { profileId: adminId } = user;
      const {
        groupPicture,
        members: { value: jsonMembers },
        name,
        type
      } = data;
      const members = this.#parseMemberIdsFromJson(jsonMembers);

      await this.#requireAdminProfile(adminId);
      this.#validateMembersForCreate(adminId, members, type);

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

      const memberProfiles = await this.#requireProfilesInMemberOrder(members);

      const chatCreation: Omit<TChat, 'createdAt' | 'id' | 'updatedAt'> = {
        members,
        type: type.value
      };

      if (groupPicture) {
        try {
          chatCreation.groupPicture = await savePicture(groupPicture);
        } catch {
          throw new HTTPError({
            message: ExceptionMessage.ERROR_SAVING_FILE,
            status: HTTPCode.INTERNAL_SERVER_ERROR
          });
        }
      }

      if (type.value === ChatType.GROUP) {
        chatCreation.adminId = adminId;
      }

      if (name) {
        chatCreation.name = name.value;
      }

      const createdChat = await this.#chatRepository.create(chatCreation);

      await this.#createChatToUserRecords(createdChat.id, members);

      const creationPayload = this.#formatChatResponse({
        adminId,
        chat: createdChat,
        memberProfiles,
        type: type.value
      });

      this.#emitChatCreated(creationPayload, adminId);

      return creationPayload;
    } catch (error) {
      this.#fail('create', error);
    }
  }

  public async deleteChat(id: string, user: User): Promise<boolean> {
    try {
      const chat = await this.#requireExistingChat(id);
      const notifyMemberIds = [...chat.members];

      if (chat.type === ChatType.PRIVATE) {
        this.#requireChatMember(chat, user.profileId);
        await this.#messageRepository.deleteByChatId(id);

        const deleted = Boolean(await this.#chatRepository.deleteById(id));

        if (deleted) {
          this.#emitChatDeleted(id, notifyMemberIds);
        }

        return deleted;
      }

      if (chat.adminId !== user.profileId && user.role !== UserRole.ADMIN) {
        throw new HTTPError({
          message: ExceptionMessage.FORBIDDEN,
          status: HTTPCode.FORBIDDEN
        });
      }

      await this.#messageRepository.deleteByChatId(id);
      await this.#deleteChatToUserRecords(id);

      const deleted = Boolean(await this.#chatRepository.deleteById(id));

      if (deleted) {
        this.#emitChatDeleted(id, notifyMemberIds);
      }

      return deleted;
    } catch (error) {
      this.#fail('deleteChat', error);
    }
  }

  public async getChat(id: string, user: User): Promise<ChatGetResponseDto> {
    try {
      const chat = await this.#requireChatAsMember(id, user.profileId);

      const profiles = await this.#profileRepository.getProfilesByIds(
        chat.members
      );

      if (profiles.length !== chat.members.length) {
        throw new HTTPError({
          message: ExceptionMessage.MEMBER_NOT_FOUND,
          status: HTTPCode.NOT_FOUND
        });
      }

      const lastPinnedMessage = await this.#getLastMessage(chat, true);

      return {
        members: profiles,
        ...(chat.adminId && { adminId: chat.adminId }),
        ...(lastPinnedMessage && { lastPinnedMessage })
      };
    } catch (error) {
      this.#fail('getChat', error);
    }
  }

  public async getChatForAdmin(id: string): Promise<ChatGetResponseDto> {
    try {
      const chat = await this.#requireExistingChat(id);
      const profiles = await this.#profileRepository.getProfilesByIds(
        chat.members
      );

      if (profiles.length !== chat.members.length) {
        throw new HTTPError({
          message: ExceptionMessage.MEMBER_NOT_FOUND,
          status: HTTPCode.NOT_FOUND
        });
      }

      const lastPinnedMessage = await this.#getLastMessage(chat, true);

      return {
        members: profiles,
        ...(chat.adminId && { adminId: chat.adminId }),
        ...(lastPinnedMessage && { lastPinnedMessage })
      };
    } catch (error) {
      this.#fail('getChatForAdmin', error);
    }
  }

  public async getMyChats(user: User): Promise<ChatsResponseDto> {
    try {
      const { profileId: userId } = user;

      const chatToUserRecords =
        await this.#chatToUserRepository.getAllByUserId(userId);

      if (chatToUserRecords.length === EMPTY_LENGTH) {
        return [];
      }

      const chatIds = chatToUserRecords.map(record => record.chatId);

      if (chatIds.length > MAX_CHAT_IDS_PER_QUERY) {
        this.#logger.warn('ChatService.getMyChats: loading chats in batches', {
          batchSize: MAX_CHAT_IDS_PER_QUERY,
          chatCount: chatIds.length
        });
      }

      const chats = await this.#loadChatsByIdsInBatches(chatIds);

      const lastViewedMap = new Map(
        chatToUserRecords.map(record => [record.chatId, record.lastViewedAt])
      );

      const formattedChats = await Promise.all(
        chats.map(
          async chat =>
            await this.#formatChat(chat, userId, lastViewedMap.get(chat.id))
        )
      );

      return [...formattedChats].toSorted(compareChatsByLastMessageDesc);
    } catch (error) {
      this.#fail('getMyChats', error);
    }
  }

  public async leaveChat(
    id: string,
    user: User
  ): Promise<ChatGetResponseDto | null> {
    try {
      const chat = await this.#requireChatAsMember(id, user.profileId);

      await this.#deleteChatToUserRecords(id, [user.profileId]);

      chat.members = chat.members.filter(member => member !== user.profileId);

      if (chat.type === ChatType.PRIVATE) {
        await this.#messageRepository.deleteByChatId(id);
        await this.#chatRepository.deleteById(id);

        return null;
      }

      if (chat.adminId === user.profileId) {
        if (chat.members.length === EMPTY_LENGTH) {
          await this.#messageRepository.deleteByChatId(id);
          await this.#chatRepository.deleteById(id);

          return null;
        }

        const [nextAdminId] = chat.members;

        if (nextAdminId) {
          chat.adminId = nextAdminId;
        }
      }

      await this.#chatRepository.updateById(id, chat);

      const profiles = await this.#requireProfilesInMemberOrder(chat.members);

      return {
        members: profiles,
        ...(chat.adminId && { adminId: chat.adminId })
      };
    } catch (error) {
      this.#fail('leaveChat', error);
    }
  }

  public async listAllChatsForAdmin(): Promise<ChatsResponseDto> {
    try {
      const chats = await this.#chatRepository.getAll();
      const items = await Promise.all(
        chats.map(async chat => await this.#formatChatListItemForAdmin(chat))
      );

      return [...items].toSorted(compareChatsByLastMessageDesc);
    } catch (error) {
      this.#fail('listAllChatsForAdmin', error);
    }
  }

  public async purgeUserMembership(profileId: string): Promise<void> {
    try {
      for (;;) {
        const chats = await this.#chatRepository.getByProfileId(profileId);

        if (chats.length === EMPTY_LENGTH) {
          break;
        }

        const [firstChat] = chats;

        if (!firstChat) {
          break;
        }

        await this.#purgeProfileFromSingleChat(firstChat, profileId);
      }
    } catch (error) {
      this.#fail('purgeUserMembership', error);
    }
  }

  public async removeMember(
    id: string,
    user: User,
    member: string
  ): Promise<ChatGetResponseDto> {
    try {
      if (typeof member !== 'string' || member.trim().length === EMPTY_LENGTH) {
        throw new HTTPError({
          message: ExceptionMessage.INVALID_CHAT_ID,
          status: HTTPCode.BAD_REQUEST
        });
      }

      const chat = await this.#requireExistingChat(id);

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

      if (!chat.members.includes(member)) {
        throw new HTTPError({
          message: ExceptionMessage.USER_NOT_IN_CHAT,
          status: HTTPCode.CONFLICT
        });
      }

      await this.#deleteChatToUserRecords(id, [member]);

      chat.members = chat.members.filter(memberId => memberId !== member);
      await this.#chatRepository.updateById(id, chat);

      const profiles = await this.#requireProfilesInMemberOrder(chat.members);

      return {
        members: profiles,
        ...(chat.adminId && { adminId: chat.adminId })
      };
    } catch (error) {
      this.#fail('removeMember', error);
    }
  }

  public async summarizeChatHistory(
    id: string,
    user: User,
    { endTime, startTime }: ChatSummaryRequestDto
  ): Promise<ChatSummaryResponseDto> {
    try {
      await this.#requireChatAsMember(id, user.profileId);

      const startDate = this.#assertValidDate(
        startTime,
        ExceptionMessage.INVALID_LAST_VIEWED_AT
      );
      const endDate = this.#assertValidDate(
        endTime,
        ExceptionMessage.INVALID_LAST_VIEWED_AT
      );

      if (endDate.getTime() < startDate.getTime()) {
        throw new HTTPError({
          message: ExceptionMessage.SUMMARY_INVALID_TIME_RANGE,
          status: HTTPCode.BAD_REQUEST
        });
      }

      const messages =
        await this.#messageRepository.getMessagesByChatIdInTimeRange({
          chatId: id,
          endTime: endDate,
          startTime: startDate
        });

      if (messages.length === EMPTY_LENGTH) {
        throw new HTTPError({
          message: ExceptionMessage.SUMMARY_NO_MESSAGES_IN_RANGE,
          status: HTTPCode.BAD_REQUEST
        });
      }

      if (messages.length > MAX_MESSAGES_FOR_SUMMARY) {
        throw new HTTPError({
          message: ExceptionMessage.SUMMARY_TOO_MANY_MESSAGES,
          status: HTTPCode.BAD_REQUEST
        });
      }

      const senderIds = [...new Set(messages.map(message => message.senderId))];
      const profiles =
        await this.#profileRepository.getProfilesByIds(senderIds);

      const nameById = new Map(
        profiles.map(profile => [profile.id, profile.username] as const)
      );

      const summary = await this.#summaryService.summarizeFromMessages(
        messages,
        nameById
      );

      return { summary };
    } catch (error) {
      this.#fail('summarizeChatHistory', error);
    }
  }

  public async updateChat(
    id: string,
    user: User,
    data: ChatUpdateRequestDto
  ): Promise<ChatUpdateResponseDto> {
    try {
      const chat = await this.#requireExistingChat(id);

      const { groupPicture, name } = data;
      let previousGroupPicture: string | undefined;

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
        previousGroupPicture = chat.groupPicture;

        try {
          chat.groupPicture = await savePicture(groupPicture);
        } catch {
          throw new HTTPError({
            message: ExceptionMessage.ERROR_SAVING_FILE,
            status: HTTPCode.INTERNAL_SERVER_ERROR
          });
        }
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

      if (groupPicture && previousGroupPicture) {
        void deleteStoredUserMedia(previousGroupPicture).catch(() => {});
      }

      return response;
    } catch (error) {
      this.#fail('updateChat', error);
    }
  }

  public async updateLastViewedTime(
    id: string,
    user: User,
    lastViewedMessageTime: string
  ): Promise<UpdateLastViewedTimeResponseDto> {
    try {
      if (
        typeof lastViewedMessageTime !== 'string' ||
        lastViewedMessageTime.trim().length === EMPTY_LENGTH
      ) {
        throw new HTTPError({
          message: ExceptionMessage.INVALID_LAST_VIEWED_AT,
          status: HTTPCode.BAD_REQUEST
        });
      }

      const date = this.#assertValidDate(
        lastViewedMessageTime,
        ExceptionMessage.INVALID_LAST_VIEWED_AT
      );

      const relation = await this.#chatToUserRepository.update(
        id,
        user.profileId,
        date
      );

      if (!relation) {
        throw new HTTPError({
          message: ExceptionMessage.CHAT_NOT_FOUND,
          status: HTTPCode.NOT_FOUND
        });
      }

      const unreadCount = await this.#messageRepository.getUnreadCount(
        id,
        date
      );

      return {
        id,
        unreadCount
      };
    } catch (error) {
      this.#fail('updateLastViewedTime', error);
    }
  }

  #assertValidDate(value: string, errorMessage: string): Date {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new HTTPError({
        message: errorMessage,
        status: HTTPCode.BAD_REQUEST
      });
    }

    return date;
  }

  async #createChatToUserRecords(
    chatId: string,
    memberProfileIds: string[]
  ): Promise<void> {
    if (memberProfileIds.length === EMPTY_LENGTH) {
      return;
    }

    const now = new Date().toISOString();

    await Promise.all(
      memberProfileIds.map(userId =>
        this.#chatToUserRepository.create({
          chatId,
          lastViewedAt: now,
          userId
        })
      )
    );
  }

  async #deleteChatToUserRecords(
    chatId: string,
    userIds?: string[]
  ): Promise<void> {
    if (userIds) {
      await Promise.all(
        userIds.map(userId => this.#chatToUserRepository.delete(chatId, userId))
      );

      return;
    }

    const chat = await this.#requireExistingChat(chatId);

    await Promise.all(
      chat.members.map(userId =>
        this.#chatToUserRepository.delete(chatId, userId)
      )
    );
  }

  #emitChatCreated(
    chat: ChatCreationResponseDto,
    createdByProfileId: string
  ): void {
    try {
      const io = this.#getIo();
      const payload = {
        chat,
        createdByProfileId
      };

      for (const member of chat.members) {
        io.to(userRoomId(member.id)).emit(SocketEvents.CHAT_CREATED, payload);
      }
    } catch {
      // Socket.IO may be uninitialized (e.g. in isolated unit tests).
    }
  }

  #emitChatDeleted(chatId: string, memberIds: readonly string[]): void {
    try {
      const io = this.#getIo();

      for (const memberId of memberIds) {
        io.to(userRoomId(memberId)).emit(SocketEvents.CHAT_DELETED, { chatId });
      }
    } catch {
      // Socket.IO may be uninitialized (e.g. in isolated unit tests).
    }
  }

  /** Maps HTTP errors through; logs and wraps unexpected failures so the process stays predictable. */
  #fail(operation: string, error: unknown): never {
    if (error instanceof HTTPError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);

    this.#logger.error(`ChatService.${operation} failed`, {
      cause: message,
      stack: error instanceof Error ? error.stack : undefined
    });

    throw new HTTPError({
      cause: error,
      status: HTTPCode.INTERNAL_SERVER_ERROR
    });
  }

  async #formatChat(
    chat: TChat,
    userId: string,
    lastViewedAt?: string
  ): Promise<ChatsResponseDto[number]> {
    const lastMessage = await this.#getLastMessage(chat);
    const { chatPicture, name } = await this.#getChatMetadata(chat, userId);

    let hasUnreadMessages = false;
    let unreadCount = INITIAL_UNREAD_COUNT;

    if (lastViewedAt && lastMessage) {
      const lastViewedDate = new Date(lastViewedAt);

      // Invalid persisted timestamps should not break the whole list response.
      if (!Number.isNaN(lastViewedDate.getTime())) {
        hasUnreadMessages = new Date(lastMessage.createdAt) > lastViewedDate;

        if (hasUnreadMessages) {
          unreadCount = await this.#messageRepository.getUnreadCount(
            chat.id,
            lastViewedDate
          );
        }
      }
    }

    return {
      id: chat.id,
      name,
      type: chat.type,
      unreadCount,
      ...(chat.type === ChatType.GROUP && { memberCount: chat.members.length }),
      ...(lastMessage && { lastMessage }),
      ...(chatPicture && { chatPicture })
    };
  }

  async #formatChatListItemForAdmin(
    chat: TChat
  ): Promise<ChatsResponseDto[number]> {
    const lastMessage = await this.#getLastMessage(chat);
    let name = '';
    let chatPicture: string | undefined;

    if (chat.type === ChatType.GROUP) {
      name = chat.name ?? '';
      chatPicture = chat.groupPicture;
    } else {
      const profiles = await this.#profileRepository.getProfilesByIds(
        chat.members
      );
      name = profiles.map(profileItem => profileItem.username).join(' · ');
      const firstWithPicture = profiles.find(
        profileItem => profileItem.profilePicture
      );

      if (firstWithPicture?.profilePicture) {
        chatPicture = firstWithPicture.profilePicture;
      }
    }

    return {
      id: chat.id,
      name,
      type: chat.type,
      unreadCount: INITIAL_UNREAD_COUNT,
      ...(chat.type === ChatType.GROUP && {
        memberCount: chat.members.length
      }),
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
      unreadCount: INITIAL_UNREAD_COUNT,
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
    chat: TChat,
    pinned?: boolean
  ): Promise<ChatsResponseDto[number]['lastMessage'] | undefined> {
    if (!chat.lastMessageId) {
      return undefined;
    }

    const message = await (pinned
      ? this.#messageRepository.getLastPinnedMessageByChatId(chat.id)
      : this.#messageRepository.getById(chat.lastMessageId));

    if (!message) {
      return undefined;
    }

    const lastMessage = {
      content: message.content,
      createdAt: message.createdAt,
      id: message.id,
      senderName: '',
      type: message.type,
      ...(message.fileUrl && { fileUrl: message.fileUrl })
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
    members: string[]
  ): Promise<ChatCreationResponseDto | null> {
    // Copy before sort so we never mutate the caller's array (JSON order is preserved elsewhere).
    const sortedMemberIds = [...members].toSorted((a, b) => a.localeCompare(b));
    const existingChat =
      await this.#chatRepository.findPrivateChatByMembers(sortedMemberIds);

    if (!existingChat) {
      return null;
    }

    const existingMemberProfiles =
      await this.#requireProfilesInMemberOrder(members);

    return this.#formatChatResponse({
      adminId,
      chat: existingChat,
      memberProfiles: existingMemberProfiles,
      type: ChatType.PRIVATE
    });
  }

  async #loadChatsByIdsInBatches(chatIds: string[]): Promise<TChat[]> {
    const uniqueIds = [...new Set(chatIds)];

    if (uniqueIds.length === EMPTY_LENGTH) {
      return [];
    }

    const batches: string[][] = [];

    for (
      let index = EMPTY_LENGTH;
      index < uniqueIds.length;
      index += MAX_CHAT_IDS_PER_QUERY
    ) {
      batches.push(uniqueIds.slice(index, index + MAX_CHAT_IDS_PER_QUERY));
    }

    const batchResults = await Promise.all(
      batches.map(ids => this.#chatRepository.getByIds(ids))
    );

    return batchResults.flat();
  }

  #parseMemberIdsFromJson(jsonMembers: string): string[] {
    if (
      typeof jsonMembers !== 'string' ||
      jsonMembers.trim().length === EMPTY_LENGTH
    ) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_MEMBERS_JSON,
        status: HTTPCode.BAD_REQUEST
      });
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonMembers) as unknown;
    } catch {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_MEMBERS_JSON,
        status: HTTPCode.BAD_REQUEST
      });
    }

    if (!Array.isArray(parsed)) {
      throw new HTTPError({
        message: ExceptionMessage.NOT_VALID_MEMBERS_COUNT,
        status: HTTPCode.BAD_REQUEST
      });
    }

    const memberIds = parsed.map(entry => {
      if (typeof entry === 'string') {
        return entry.trim();
      }

      if (typeof entry === 'number' && Number.isFinite(entry)) {
        return String(entry);
      }

      return '';
    });

    if (memberIds.some(id => id.length === EMPTY_LENGTH)) {
      throw new HTTPError({
        message: ExceptionMessage.NOT_VALID_MEMBERS_COUNT,
        status: HTTPCode.BAD_REQUEST
      });
    }

    if (new Set(memberIds).size !== memberIds.length) {
      throw new HTTPError({
        message: ExceptionMessage.NOT_VALID_MEMBERS_COUNT,
        status: HTTPCode.BAD_REQUEST
      });
    }

    return memberIds;
  }

  async #purgeProfileFromSingleChat(
    chat: TChat,
    profileId: string
  ): Promise<void> {
    const notifyMemberIds = [...chat.members];

    if (!chat.members.includes(profileId)) {
      return;
    }

    await this.#deleteChatToUserRecords(chat.id, [profileId]);
    chat.members = chat.members.filter(memberId => memberId !== profileId);

    if (chat.type === ChatType.PRIVATE) {
      await this.#messageRepository.deleteByChatId(chat.id);
      await this.#deleteChatToUserRecords(chat.id);
      await this.#chatRepository.deleteById(chat.id);
      this.#emitChatDeleted(chat.id, notifyMemberIds);

      return;
    }

    if (chat.members.length === EMPTY_LENGTH) {
      await this.#messageRepository.deleteByChatId(chat.id);
      await this.#deleteChatToUserRecords(chat.id);
      await this.#chatRepository.deleteById(chat.id);
      this.#emitChatDeleted(chat.id, notifyMemberIds);

      return;
    }

    if (chat.adminId === profileId) {
      const [nextAdminId] = chat.members;

      if (nextAdminId) {
        chat.adminId = nextAdminId;
      }
    }

    await this.#chatRepository.updateById(chat.id, chat);
  }

  async #requireAdminProfile(adminId: string): Promise<Profile> {
    const adminProfile = await this.#profileRepository.getById(adminId);

    if (!adminProfile) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return adminProfile;
  }

  async #requireChatAsMember(
    chatId: string,
    profileId: string
  ): Promise<TChat> {
    const chat = await this.#requireExistingChat(chatId);
    this.#requireChatMember(chat, profileId);

    return chat;
  }

  #requireChatMember(chat: TChat, profileId: string): void {
    if (!chat.members.includes(profileId)) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_IN_CHAT,
        status: HTTPCode.FORBIDDEN
      });
    }
  }

  async #requireExistingChat(chatId: string): Promise<TChat> {
    const chat = await this.#chatRepository.getById(chatId);

    if (!chat) {
      throw new HTTPError({
        message: ExceptionMessage.CHAT_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return chat;
  }

  /**
   * Loads all profiles in one query (avoids N+1), preserves caller order, and enforces
   * that every member id resolves to a profile.
   */
  async #requireProfilesInMemberOrder(
    memberProfileIds: string[]
  ): Promise<Profile[]> {
    if (memberProfileIds.length === EMPTY_LENGTH) {
      throw new HTTPError({
        message: ExceptionMessage.NOT_VALID_MEMBERS_COUNT,
        status: HTTPCode.BAD_REQUEST
      });
    }

    const profiles =
      await this.#profileRepository.getProfilesByIds(memberProfileIds);

    if (profiles.length !== memberProfileIds.length) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    const profileById = new Map(profiles.map(profile => [profile.id, profile]));

    return memberProfileIds.map(memberId => {
      const profile = profileById.get(memberId);

      if (!profile) {
        throw new HTTPError({
          message: ExceptionMessage.MEMBER_NOT_FOUND,
          status: HTTPCode.NOT_FOUND
        });
      }

      return profile;
    });
  }

  #validateMembersForCreate(
    adminId: string,
    members: string[],
    type: { value: ValueOf<typeof ChatType> }
  ): void {
    if (!members.includes(adminId)) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    if (
      type.value === ChatType.PRIVATE &&
      members.length !== ChatValidationRule.PRIVATE_MEMBERS_COUNT
    ) {
      throw new HTTPError({
        message: ExceptionMessage.NOT_VALID_MEMBERS_COUNT,
        status: HTTPCode.BAD_REQUEST
      });
    }

    if (
      type.value === ChatType.GROUP &&
      members.length > MAX_GROUP_CHAT_MEMBERS
    ) {
      throw new HTTPError({
        message: ExceptionMessage.NOT_VALID_MEMBERS_COUNT,
        status: HTTPCode.BAD_REQUEST
      });
    }
  }
}

export { Chat };
