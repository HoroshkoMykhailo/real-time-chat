import Joi from 'joi';

import { ChatValidationMessage } from '../enums/chat-validation-message.enum.js';
import { ChatPayloadKey } from '../enums/enums.js';

type ChatSummaryTimeRangePayload = {
  [ChatPayloadKey.END_TIME]: string;
  [ChatPayloadKey.START_TIME]: string;
};

const isChatSummaryTimeRangePayload = (
  candidate: unknown
): candidate is ChatSummaryTimeRangePayload => {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }

  const record = candidate as Record<string, unknown>;

  return (
    typeof record[ChatPayloadKey.START_TIME] === 'string' &&
    typeof record[ChatPayloadKey.END_TIME] === 'string'
  );
};

const chatSummaryMessages = {
  'any.invalid': ChatValidationMessage.SUMMARY_END_BEFORE_START
};

const chatSummary = Joi.object({
  [ChatPayloadKey.END_TIME]: Joi.string().isoDate().required(),
  [ChatPayloadKey.START_TIME]: Joi.string().isoDate().required()
})
  .custom((value: unknown, helpers) => {
    if (!isChatSummaryTimeRangePayload(value)) {
      return helpers.error('any.invalid');
    }

    const start = new Date(value[ChatPayloadKey.START_TIME]);
    const end = new Date(value[ChatPayloadKey.END_TIME]);

    if (end.getTime() < start.getTime()) {
      return helpers.error('any.invalid');
    }

    return value;
  }, 'Summary time range validation')
  .messages(chatSummaryMessages);

export { chatSummary };
