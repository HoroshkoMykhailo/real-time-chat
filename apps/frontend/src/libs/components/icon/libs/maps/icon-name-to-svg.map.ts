import { type FC } from 'react';

import Arrow from '~/assets/images/icons/arrow.svg?react';
import Camera from '~/assets/images/icons/camera.svg?react';
import Error from '~/assets/images/icons/error.svg?react';
import { type IconName } from '~/libs/types/types.js';

const iconNameToSvg: Record<IconName, FC<React.SVGProps<SVGSVGElement>>> = {
  arrow: Arrow,
  camera: Camera,
  error: Error
};

export { iconNameToSvg };
