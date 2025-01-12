import { type FC } from 'react';

import Arrow from '~/assets/images/icons/arrow.svg?react';
import Camera from '~/assets/images/icons/camera.svg?react';
import Cancel from '~/assets/images/icons/cancel.svg?react';
import Copy from '~/assets/images/icons/copy.svg?react';
import Download from '~/assets/images/icons/download.svg?react';
import Error from '~/assets/images/icons/error.svg?react';
import File from '~/assets/images/icons/file.svg?react';
import Group from '~/assets/images/icons/group.svg?react';
import Image from '~/assets/images/icons/image.svg?react';
import Microphone from '~/assets/images/icons/microphone.svg?react';
import PaperClip from '~/assets/images/icons/paper-clip.svg?react';
import Pencil from '~/assets/images/icons/pencil.svg?react';
import Person from '~/assets/images/icons/person.svg?react';
import Pin from '~/assets/images/icons/pin.svg?react';
import Remove from '~/assets/images/icons/remove.svg?react';
import Search from '~/assets/images/icons/search.svg?react';
import TrashBin from '~/assets/images/icons/trash-bin.svg?react';
import UnPin from '~/assets/images/icons/unpin.svg?react';
import { type IconName } from '~/libs/types/types.js';

const iconNameToSvg: Record<IconName, FC<React.SVGProps<SVGSVGElement>>> = {
  arrow: Arrow,
  camera: Camera,
  cancel: Cancel,
  copy: Copy,
  download: Download,
  error: Error,
  file: File,
  group: Group,
  image: Image,
  microphone: Microphone,
  paperClip: PaperClip,
  pencil: Pencil,
  person: Person,
  pin: Pin,
  remove: Remove,
  search: Search,
  trashBin: TrashBin,
  unPin: UnPin
};

export { iconNameToSvg };
