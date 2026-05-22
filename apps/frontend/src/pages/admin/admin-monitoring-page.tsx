import { type ChatsResponseDto, ChatType } from '@team-link/shared';

import { Loader, NavLink } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import { useEffect, useState } from '~/libs/hooks/hooks.js';
import { toastNotifier } from '~/libs/modules/toast-notifier/toast-notifier.js';
import { adminApi } from '~/modules/admin/admin.js';

import styles from './styles.module.scss';

const CHAT_TYPE_UA: Record<string, string> = {
  [ChatType.GROUP]: 'Група',
  [ChatType.PRIVATE]: 'Приватний чат'
};

const LAST_MESSAGE_PREVIEW_LENGTH = 80;

const SLICE_START_INDEX = 0;

const formatLastMessageCell = (
  lastMessage: ChatsResponseDto[number]['lastMessage']
): string => {
  if (!lastMessage) {
    return '—';
  }

  const name = lastMessage.senderName;
  const text = lastMessage.content;
  const preview = text.slice(SLICE_START_INDEX, LAST_MESSAGE_PREVIEW_LENGTH);
  const fileNote = lastMessage.fileUrl ? ' [файл]' : '';

  return `${name}: ${preview}${fileNote}`;
};

const AdminMonitoringPage: React.FC = () => {
  const [chats, setChats] = useState<ChatsResponseDto>([]);
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const payload = await adminApi.listChats();

        if (!cancelled) {
          setChats(payload);
        }
      } catch {
        if (!cancelled) {
          setError('Не вдалося завантажити список чатів.');
          toastNotifier.showError('Не вдалося завантажити список чатів.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return (): void => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className={styles['title']}>Моніторинг</h1>
      <p className={styles['badge']}>
        Активні чати та групи для перевірки відповідності політикам
      </p>
      {error ? <p className={styles['error']}>{error}</p> : null}
      <div className={styles['table-wrap']}>
        <table className={styles['table']}>
          <thead>
            <tr>
              <th className={styles['th']}>Назва</th>
              <th className={styles['th']}>Тип</th>
              <th className={styles['th']}>Учасників</th>
              <th className={styles['th']}>Останнє повідомлення</th>
            </tr>
          </thead>
          <tbody>
            {chats.map(chat => (
              <tr key={chat.id}>
                <td className={styles['td']}>
                  <NavLink
                    className={styles['row-link'] as string}
                    to={`${AppRoute.ADMIN}/monitoring/${chat.id}`}
                  >
                    {chat.name || '—'}
                  </NavLink>
                </td>
                <td className={styles['td']}>
                  {CHAT_TYPE_UA[chat.type] ?? chat.type}
                </td>
                <td className={styles['td']}>
                  {chat.type === ChatType.GROUP
                    ? (chat.memberCount ?? '—')
                    : '2'}
                </td>
                <td className={styles['td']}>
                  {formatLastMessageCell(chat.lastMessage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { AdminMonitoringPage };
