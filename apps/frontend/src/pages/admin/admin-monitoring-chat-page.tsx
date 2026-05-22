import {
  type ChatGetResponseDto,
  type GetMessagesResponseDto,
  MessageType
} from '@team-link/shared';

import { Loader, NavLink } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import { resolveServerMediaUrl } from '~/libs/helpers/helpers.js';
import { useEffect, useParams, useState } from '~/libs/hooks/hooks.js';
import { adminApi } from '~/modules/admin/admin.js';

import styles from './styles.module.scss';

const EMPTY_MESSAGE_COUNT = 0;

const AdminMonitoringChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();

  const [chat, setChat] = useState<ChatGetResponseDto | null>(null);
  const [messages, setMessages] = useState<GetMessagesResponseDto['messages']>(
    []
  );
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      if (!chatId) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const [chatPayload, messagesPayload] = await Promise.all([
          adminApi.getMonitoringChat(chatId),
          adminApi.getMonitoringMessages(chatId, { limit: 200 })
        ]);

        if (!cancelled) {
          setChat(chatPayload);
          setMessages(messagesPayload.messages);
        }
      } catch {
        if (!cancelled) {
          setError('Вміст недоступний через помилку або видалення.');
          setChat(null);
          setMessages([]);
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
  }, [chatId]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !chat) {
    return (
      <div>
        <h1 className={styles['title']}>Перегляд чату</h1>
        <p className={styles['error']}>
          {error ?? 'Вміст недоступний для перегляду.'}
        </p>
        <NavLink
          className={styles['row-link'] as string}
          to={`${AppRoute.ADMIN}/monitoring`}
        >
          Назад до моніторингу
        </NavLink>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles['title']}>Моніторинг чату</h1>
      <NavLink
        className={styles['row-link'] as string}
        to={`${AppRoute.ADMIN}/monitoring`}
      >
        ← До списку чатів
      </NavLink>
      <p className={styles['badge']}>
        Учасники: {chat.members.map(member => member.username).join(', ')}
      </p>

      <h2 className={styles['title']}>Повідомлення та файли</h2>
      {messages.length === EMPTY_MESSAGE_COUNT ? (
        <p>Повідомлень немає.</p>
      ) : (
        messages.map(message => (
          <div className={styles['message-row']} key={message.id}>
            <div className={styles['message-meta']}>
              {message.sender.username} ·{' '}
              {new Date(message.createdAt).toLocaleString('uk-UA')} ·{' '}
              {message.type}
            </div>
            {message.type === MessageType.TEXT ? (
              <div>{message.content}</div>
            ) : null}
            {message.fileUrl ? (
              <div>
                <a
                  href={resolveServerMediaUrl(message.fileUrl)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Відкрити файл
                </a>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
};

export { AdminMonitoringChatPage };
