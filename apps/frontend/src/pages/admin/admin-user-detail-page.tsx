import { type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';

import { Button, Loader, NavLink } from '~/libs/components/components.js';
import { AppRoute, UserRole } from '~/libs/enums/enums.js';
import {
  useCallback,
  useEffect,
  useNavigate,
  useParams,
  useState
} from '~/libs/hooks/hooks.js';
import { toastNotifier } from '~/libs/modules/toast-notifier/toast-notifier.js';
import { adminApi, type AdminUserDetail } from '~/modules/admin/admin.js';

import styles from './styles.module.scss';

const ROLE_LABEL: Record<string, string> = {
  [UserRole.ADMIN]: 'Адміністратор',
  [UserRole.USER]: 'Користувач'
};

const EXPECTED_EMAIL_PARTS = 2;

const MIN_DOMAIN_LENGTH_WITH_DOT = 3;

const MIN_LOCAL_PART_LENGTH = 1;

const NO_VALIDATION_ERROR_KEYS = 0;

const isLikelyValidEmail = (value: string): boolean => {
  const parts = value.split('@');

  if (parts.length !== EXPECTED_EMAIL_PARTS) {
    return false;
  }

  const [local, domain] = parts;

  if (typeof local !== 'string' || typeof domain !== 'string') {
    return false;
  }

  return (
    local.length >= MIN_LOCAL_PART_LENGTH &&
    domain.length >= MIN_DOMAIN_LENGTH_WITH_DOT &&
    domain.includes('.')
  );
};

const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loadError, setLoadError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<string>(UserRole.USER);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    username?: string;
  }>({});
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadDetail = useCallback(async (): Promise<void> => {
    if (!userId) {
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const payload = await adminApi.getUserDetail(userId);
      setDetail(payload);
      setEmail(payload.user.email);
      setUsername(payload.profile.username);
      setRole(payload.user.role);
    } catch {
      setLoadError(
        'Не вдалося завантажити профіль користувача. Можливо, дані недоступні або сталася помилка.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleStartEdit = useCallback((): void => {
    if (!detail) {
      return;
    }

    setIsEditing(true);
    setFieldErrors({});
    setEmail(detail.user.email);
    setUsername(detail.profile.username);
    setRole(detail.user.role);
  }, [detail]);

  const handleCancelEdit = useCallback((): void => {
    setIsEditing(false);
    setFieldErrors({});
  }, []);

  const validate = useCallback((): boolean => {
    const next: { email?: string; username?: string } = {};
    const trimmedName = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      next.username = "Ім'я не може бути порожнім.";
    }

    if (!trimmedEmail) {
      next.email = 'Електронна пошта не може бути порожньою.';
    } else if (!isLikelyValidEmail(trimmedEmail)) {
      next.email = 'Некоректний формат електронної пошти.';
    }

    setFieldErrors(next);

    return Object.keys(next).length === NO_VALIDATION_ERROR_KEYS;
  }, [email, username]);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!userId || !validate()) {
      return;
    }

    try {
      setIsSaving(true);
      const updated = await adminApi.updateUser(userId, {
        email: email.trim(),
        role,
        username: username.trim()
      });
      setDetail(updated);
      setIsEditing(false);
      toastNotifier.showSuccess('Профіль збережено.');
    } catch {
      toastNotifier.showError('Не вдалося зберегти зміни.');
    } finally {
      setIsSaving(false);
    }
  }, [email, role, userId, username, validate]);

  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    if (!userId) {
      return;
    }

    try {
      setIsDeleting(true);
      await adminApi.deleteUser(userId);
      toastNotifier.showSuccess('Обліковий запис видалено.');
      void navigate(`${AppRoute.ADMIN}/users`);
    } catch {
      toastNotifier.showError(
        'Під час видалення сталася помилка. Спробуйте ще раз.'
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  }, [navigate, userId]);

  const handleUsernameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      setUsername(event.target.value);
    },
    []
  );

  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      setEmail(event.target.value);
    },
    []
  );

  const handleRoleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      setRole(event.target.value);
    },
    []
  );

  const handleOpenDeleteModal = useCallback((): void => {
    setIsDeleteOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback((): void => {
    setIsDeleteOpen(false);
  }, []);

  const handleBackdropClick = useCallback((): void => {
    setIsDeleteOpen(false);
  }, []);

  const handleBackdropKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Escape') {
        setIsDeleteOpen(false);
      }
    },
    []
  );

  const handleModalInnerClick = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      event.stopPropagation();
    },
    []
  );

  const handleModalInnerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      event.stopPropagation();
    },
    []
  );

  const handleConfirmDeleteClick = useCallback((): void => {
    void handleConfirmDelete();
  }, [handleConfirmDelete]);

  if (isLoading) {
    return <Loader />;
  }

  if (loadError || !detail) {
    return (
      <div>
        <h1 className={styles['title']}>Профіль користувача</h1>
        <p className={styles['error']}>
          {loadError ?? 'Профіль користувача недоступний. Спробуйте пізніше.'}
        </p>
        <NavLink
          className={styles['row-link'] as string}
          to={`${AppRoute.ADMIN}/users`}
        >
          Назад до списку
        </NavLink>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles['title']}>Профіль користувача</h1>
      <NavLink
        className={styles['row-link'] as string}
        to={`${AppRoute.ADMIN}/users`}
      >
        ← До списку користувачів
      </NavLink>

      <div className={styles['field']}>
        <span className={styles['label']}>Ім&apos;я</span>
        {isEditing ? (
          <>
            <input
              className={styles['input']}
              onChange={handleUsernameChange}
              type="text"
              value={username}
            />
            {fieldErrors.username ? (
              <div className={styles['validation']}>{fieldErrors.username}</div>
            ) : null}
          </>
        ) : (
          <div>{detail.profile.username}</div>
        )}
      </div>

      <div className={styles['field']}>
        <span className={styles['label']}>Електронна пошта</span>
        {isEditing ? (
          <>
            <input
              className={styles['input']}
              onChange={handleEmailChange}
              type="email"
              value={email}
            />
            {fieldErrors.email ? (
              <div className={styles['validation']}>{fieldErrors.email}</div>
            ) : null}
          </>
        ) : (
          <div>{detail.user.email}</div>
        )}
      </div>

      <div className={styles['field']}>
        <span className={styles['label']}>Роль</span>
        {isEditing ? (
          <select
            className={styles['select']}
            onChange={handleRoleChange}
            value={role}
          >
            {Object.values(UserRole).map(value => (
              <option key={value} value={value}>
                {ROLE_LABEL[value] ?? value}
              </option>
            ))}
          </select>
        ) : (
          <div>{ROLE_LABEL[detail.user.role] ?? detail.user.role}</div>
        )}
      </div>

      <div className={styles['field']}>
        <span className={styles['label']}>Мова інтерфейсу профілю</span>
        <div>{detail.profile.language}</div>
      </div>

      <div className={styles['actions']}>
        {isEditing ? (
          <>
            <Button isDisabled={isSaving} isPrimary onClick={handleSave}>
              Зберегти
            </Button>
            <Button isBasic isDisabled={isSaving} onClick={handleCancelEdit}>
              Скасувати
            </Button>
          </>
        ) : (
          <Button isPrimary onClick={handleStartEdit}>
            Редагувати
          </Button>
        )}
        <button
          className={styles['destructive']}
          onClick={handleOpenDeleteModal}
          type="button"
        >
          Видалення акаунту
        </button>
      </div>

      {isDeleteOpen ? (
        <div
          className={styles['modal-backdrop']}
          onClick={handleBackdropClick}
          onKeyDown={handleBackdropKeyDown}
          role="presentation"
        >
          <div
            className={styles['modal']}
            onClick={handleModalInnerClick}
            onKeyDown={handleModalInnerKeyDown}
            role="presentation"
          >
            <h2 className={styles['title']}>Підтвердження видалення</h2>
            <p>
              Ви впевнені, що хочете назавжди видалити цей обліковий запис? Цю
              дію неможливо скасувати.
            </p>
            <div className={styles['modal-actions']}>
              <button
                className={styles['secondary']}
                onClick={handleCloseDeleteModal}
                type="button"
              >
                Скасувати
              </button>
              <button
                className={styles['destructive']}
                disabled={isDeleting}
                onClick={handleConfirmDeleteClick}
                type="button"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { AdminUserDetailPage };
