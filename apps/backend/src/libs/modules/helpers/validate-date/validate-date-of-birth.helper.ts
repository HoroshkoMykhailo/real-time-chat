import { MIN_YEAR } from '../../constants/min-year.constant.js';

const MONTH_OFFSET = 1;

const isValidDateOfBirth = (dateOfBirth: string): boolean => {
  const dateRegex = /^(?:\d{2}\.){2}\d{4}$/;

  if (!dateRegex.test(dateOfBirth)) {
    return false;
  }

  const [day, month, year] = dateOfBirth.split('.').map(Number);

  if (!day || !month || !year) {
    return false;
  }

  const date = new Date(year, month - MONTH_OFFSET, day);
  const isValidDate =
    date.getFullYear() === year &&
    date.getMonth() === month - MONTH_OFFSET &&
    date.getDate() === day;

  if (!isValidDate) {
    return false;
  }

  const now = new Date();

  return !(date > now || year < MIN_YEAR);
};

export { isValidDateOfBirth };
