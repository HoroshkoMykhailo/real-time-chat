import { GoogleGenAI } from '@google/genai';
import { MessageType } from '@team-link/shared';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { type ConfigModule } from '~/libs/modules/config/config.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { type Message } from '~/modules/message/libs/types/types.js';

import { SUMMARY_SYSTEM_PROMPT } from './libs/constants/constants.js';
import { type SummaryService } from './libs/types/types.js';

type Constructor = {
  config: ConfigModule;
};

const attachmentPlaceholder: Record<string, string> = {
  [MessageType.AUDIO]: '[voice message]',
  [MessageType.FILE]: '[file]',
  [MessageType.IMAGE]: '[image]',
  [MessageType.VIDEO]: '[video]'
};

const EMPTY_LENGTH = 0;

class Summary implements SummaryService {
  #client: GoogleGenAI;

  #modelId: string;

  public constructor({ config }: Constructor) {
    const { GOOGLE_CLOUD } = config.ENV;

    this.#client = new GoogleGenAI({
      location: GOOGLE_CLOUD.VERTEX_LOCATION,
      project: GOOGLE_CLOUD.PROJECT_ID,
      vertexai: true
    });
    this.#modelId = GOOGLE_CLOUD.SUMMARY_MODEL;
  }

  public async summarizeFromMessages(
    messages: Message[],
    senderIdToDisplayName: Map<string, string>
  ): Promise<string> {
    const transcript = this.#buildTranscript(messages, senderIdToDisplayName);

    if (!transcript.trim()) {
      throw new HTTPError({
        message: ExceptionMessage.SUMMARY_NO_MESSAGES_IN_RANGE,
        status: HTTPCode.BAD_REQUEST
      });
    }

    try {
      const response = await this.#client.models.generateContent({
        config: {
          maxOutputTokens: 2048,
          systemInstruction: SUMMARY_SYSTEM_PROMPT,
          temperature: 0.3
        },
        contents: transcript,
        model: this.#modelId
      });

      const text = response.text?.trim() ?? '';

      if (!text) {
        throw new HTTPError({
          message: ExceptionMessage.SUMMARY_GENERATION_FAILED,
          status: HTTPCode.INTERNAL_SERVER_ERROR
        });
      }

      return text;
    } catch (error) {
      if (error instanceof HTTPError) {
        throw error;
      }

      throw new HTTPError({
        message: ExceptionMessage.SUMMARY_GENERATION_FAILED,
        status: HTTPCode.INTERNAL_SERVER_ERROR
      });
    }
  }

  #buildTranscript(
    messages: Message[],
    senderIdToDisplayName: Map<string, string>
  ): string {
    const lines: string[] = [];

    for (const message of messages) {
      const sender =
        senderIdToDisplayName.get(message.senderId) ?? message.senderId;
      const timestamp = message.createdAt;
      const body = this.#messageBodyForSummary(message);

      if (!body.trim()) {
        continue;
      }

      lines.push(`[${timestamp}] ${sender}: ${body}`);
    }

    return lines.join('\n');
  }

  #messageBodyForSummary(message: Message): string {
    const trimmed = message.content.trim();

    if (trimmed.length > EMPTY_LENGTH) {
      return trimmed;
    }

    return attachmentPlaceholder[message.type] ?? '[attachment]';
  }
}

export { Summary };
