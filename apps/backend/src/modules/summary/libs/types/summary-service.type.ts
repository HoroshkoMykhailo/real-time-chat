import { type Message } from '~/modules/message/libs/types/types.js';

type SummaryService = {
  summarizeFromMessages(
    messages: Message[],
    senderIdToDisplayName: Map<string, string>
  ): Promise<string>;
};

export { type SummaryService };
