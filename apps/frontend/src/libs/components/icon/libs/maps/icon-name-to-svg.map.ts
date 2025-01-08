import { type FC } from 'react';

import Arrow from '~/assets/images/icons/arrow.svg?react';
import Camera from '~/assets/images/icons/camera.svg?react';
import Cancel from '~/assets/images/icons/cancel.svg?react';
import Error from '~/assets/images/icons/error.svg?react';
import Group from '~/assets/images/icons/group.svg?react';
import Pencil from '~/assets/images/icons/pencil.svg?react';
import Person from '~/assets/images/icons/person.svg?react';
import Remove from '~/assets/images/icons/remove.svg?react';
import Search from '~/assets/images/icons/search.svg?react';
import TrashBin from '~/assets/images/icons/trash-bin.svg?react';
import { type IconName } from '~/libs/types/types.js';

const iconNameToSvg: Record<IconName, FC<React.SVGProps<SVGSVGElement>>> = {
  arrow: Arrow,
  camera: Camera,
  cancel: Cancel,
  error: Error,
  group: Group,
  pencil: Pencil,
  person: Person,
  remove: Remove,
  search: Search,
  trashBin: TrashBin
};

export { iconNameToSvg };
