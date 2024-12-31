import { format, isToday } from 'date-fns';

// Функція для форматування часу
function formatLastMessageTime(createdAt: string): string {
  const messageDate = new Date(createdAt);

  return isToday(messageDate)
    ? format(messageDate, 'HH:mm')
    : format(messageDate, 'dd MMM');
}

export { formatLastMessageTime };
