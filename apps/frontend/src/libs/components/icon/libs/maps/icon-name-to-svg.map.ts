import { type FC } from 'react';

import Error from '~/assets/images/icons/error.svg?react';
import { type IconName } from '~/libs/types/types.js';

const iconNameToSvg: Record<IconName, FC<React.SVGProps<SVGSVGElement>>> = {
  error: Error
};

export { iconNameToSvg };
