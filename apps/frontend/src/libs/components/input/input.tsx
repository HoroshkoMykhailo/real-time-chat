import { ErrorMessage } from '@hookform/error-message';
import clsx from 'clsx';
import { type ReactElement } from 'react';
import {
  type Control,
  type FieldPath,
  type FieldValues
} from 'react-hook-form';

import { checkGreaterThanZero } from '~/libs/helpers/helpers.js';
import { useController, useEffect, useRef } from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

const TEXT_AREA_HEIGHT_ADJUSTMENT = 1.8;

type Properties<T extends FieldValues> = {
  className?: string;
  control: Control<T>;
  disabled?: boolean;
  errors?: object;
  isTextArea?: boolean;
  name: FieldPath<T>;
  placeholder: string;
  type?: 'email' | 'password' | 'submit' | 'text';
};

const Input = <T extends FieldValues>({
  className,
  control,
  disabled,
  errors = {},
  isTextArea = false,
  name,
  placeholder,
  type = 'text'
}: Properties<T>): ReactElement => {
  const { field } = useController<T>({ control, name });
  const hasErrors = checkGreaterThanZero(Object.keys(errors).length);

  const textareaReference = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = (): void => {
    const textarea = textareaReference.current;

    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + TEXT_AREA_HEIGHT_ADJUSTMENT}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [field.value]);

  return (
    <div className={styles['inputWrapper']}>
      <div className={styles['inputContainer']}>
        {isTextArea ? (
          <textarea
            {...field}
            className={clsx(styles['textArea'], className)}
            name={name}
            placeholder={placeholder}
            ref={textareaReference}
            rows={1}
            value={field.value}
          />
        ) : (
          <input
            {...field}
            className={clsx(styles['input'], className)}
            disabled={disabled}
            placeholder={placeholder}
            type={type}
            value={field.value}
          />
        )}
      </div>
      {hasErrors && (
        <span className={styles['errorWrapper']}>
          <ErrorMessage errors={errors} name={name} />
        </span>
      )}
    </div>
  );
};

export { Input };
