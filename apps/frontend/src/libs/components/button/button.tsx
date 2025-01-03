/* eslint-disable react/button-has-type */
import clsx from 'clsx';
import { type ReactNode } from 'react';

import { type ButtonColor } from '~/libs/enums/enums.js';
import { type ButtonType, type ValueOf } from '~/libs/types/types.js';

import { NavLink } from '../components.js';
import styles from './styles.module.scss';

type Properties = {
  children?: ReactNode;
  className?: string;
  color?: ValueOf<typeof ButtonColor>;
  href?: string;
  isBasic?: boolean;
  isDisabled?: boolean;
  isFluid?: boolean;
  isLoading?: boolean;
  isPrimary?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: ButtonType;
};

const Button: React.FC<Properties> = ({
  children,
  className,
  color,
  href,
  isBasic = false,
  isDisabled = false,
  isFluid = false,
  isLoading = false,
  isPrimary = false,
  onClick,
  type = 'button'
}) => {
  if (href) {
    return (
      <NavLink
        className={clsx(
          styles['btn'],
          isLoading && styles['loading'],
          isFluid && styles['fluid'],
          isBasic && styles['basic'],
          isPrimary && styles['primary'],
          color && styles[`btn__${color}`],
          className
        )}
        to={href}
      >
        {children}
      </NavLink>
    );
  }

  return (
    <button
      className={clsx(
        styles['btn'],
        isLoading && styles['loading'],
        isFluid && styles['fluid'],
        isBasic && styles['basic'],
        isPrimary && styles['primary'],
        color && styles[`btn__${color}`],
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export { Button };
