import { ExceptionMessage } from '~/libs/enums/enums.js';
import { savePicture } from '~/libs/modules/helpers/helpers.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { type User } from '../user/user.js';
import { type Chat as ChatRepository } from './chat.repository.js';
import { ChatType, ChatValidationRule } from './libs/enums/enums.js';
import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatService,
  type Chat as TChat
} from './libs/types/types.js';

type Constructor = {
  chatRepository: ChatRepository;
  profileRepository: ProfileRepository;
};

class Chat implements ChatService {
  #chatRepository: ChatRepository;
  #profileRepository: ProfileRepository;

  public constructor({ chatRepository, profileRepository }: Constructor) {
    this.#chatRepository = chatRepository;
    this.#profileRepository = profileRepository;
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
}

export { Chat };
