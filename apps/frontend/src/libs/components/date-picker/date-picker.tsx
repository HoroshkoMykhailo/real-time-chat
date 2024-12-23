import { ErrorMessage } from '@hookform/error-message';
import { format, parse } from 'date-fns';
import React, { type ReactElement } from 'react';
import {
  type Control,
  type FieldPath,
  type FieldValues
} from 'react-hook-form';

import { checkGreaterThanZero } from '~/libs/helpers/helper.js';
import { useCallback, useController } from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

const DEFAULT_MAX_AGE = 100;
const DEFAULT_MIN_AGE = 13;
const DATE_FORMAT = 'yyyy-MM-dd';

type DatePickerProperties<T extends FieldValues> = {
  control: Control<T>;
  errors?: object;
  maxAge?: number;
  minAge?: number;
  name: FieldPath<T>;
  placeholder?: string;
};

const DatePicker = <T extends FieldValues>({
  control,
  errors = {},
  maxAge = DEFAULT_MAX_AGE,
  minAge = DEFAULT_MIN_AGE,
  name,
  placeholder = 'Select date'
}: DatePickerProperties<T>): ReactElement => {
  const { field } = useController({ control, name });
  const today = new Date();
  const hasErrors = checkGreaterThanZero(Object.keys(errors).length);
  const maxDate = new Date(
    today.getFullYear() - minAge,
    today.getMonth(),
    today.getDate()
  );
  const minDate = new Date(
    today.getFullYear() - maxAge,
    today.getMonth(),
    today.getDate()
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const newDate = event.target.value;

      const parsedDate = parse(newDate, DATE_FORMAT, new Date());

      const formattedDate = format(parsedDate, 'dd.MM.yyyy');
      field.onChange(formattedDate);
    },
    [field]
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>): void => {
      event.target.type = 'date';
    },
    []
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>): void => {
      event.target.type = 'text';
    },
    []
  );

  const displayValue = field.value
    ? format(parse(field.value, 'dd.MM.yyyy', new Date()), DATE_FORMAT)
    : '';

  return (
    <div className={styles['datePickerWrapper']}>
      <input
        className={`${styles['datePicker']}`}
        max={format(maxDate, DATE_FORMAT)}
        min={format(minDate, DATE_FORMAT)}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        type="text"
        value={displayValue}
      />
      {hasErrors && (
        <span className={styles['errorWrapper']}>
          <ErrorMessage errors={errors} name={name} />
        </span>
      )}
    </div>
  );
};

export { DatePicker };
