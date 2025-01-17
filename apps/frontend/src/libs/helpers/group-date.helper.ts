import { format, isToday, isYesterday, subDays } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

import { type MessageHistoryItem } from '~/modules/messages/message.js';
import { ProfileLanguage } from '~/modules/profile/libs/types/types.js';

import { ONE_VALUE, ZERO_VALUE } from '../common/constants.js';
import { translate } from '../modules/localization/translate.js';
import { type ValueOf } from '../types/types.js';

const WEEK_DAYS = 7;

const groupMessagesByDate = (
  messages: MessageHistoryItem[] | null
): Record<string, MessageHistoryItem[]> => {
  if (!messages) {
    return {};
  }

  const groupedMessages: Record<string, MessageHistoryItem[]> = {};

  for (const message of messages) {
    const dateKey = format(new Date(message.createdAt), 'yyyy-MM-dd');

    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }

    groupedMessages[dateKey]?.push(message);
  }

  return groupedMessages;
};

const formatDateLabel = (
  dateKey: string,
  language: ValueOf<typeof ProfileLanguage>
): string => {
  const date = new Date(dateKey);
  const today = new Date();

  if (isToday(date)) {
    return translate.translate('today', language);
  }

  if (isYesterday(date)) {
    return translate.translate('yesterday', language);
  }

  const locale = language === ProfileLanguage.UKRAINIAN ? uk : enUS;

  const lastWeekDay = subDays(today, WEEK_DAYS);

  if (date >= lastWeekDay && date <= today) {
    const dayOfWeek = format(date, 'EEEE', { locale });

    return (
      dayOfWeek.charAt(ZERO_VALUE).toUpperCase() + dayOfWeek.slice(ONE_VALUE)
    );
  }

  return format(date, 'd MMMM', { locale });
};

export { formatDateLabel, groupMessagesByDate };
