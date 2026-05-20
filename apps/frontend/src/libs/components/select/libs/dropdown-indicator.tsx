import { type ReactElement } from 'react';
import { components, type DropdownIndicatorProps } from 'react-select';

import { Icon } from '../../components.js';

type Properties<OptionType, IsMulti extends boolean> = DropdownIndicatorProps<
  OptionType,
  IsMulti
>;

const DropdownIndicator = <OptionType, IsMulti extends boolean = false>(
  properties: Properties<OptionType, IsMulti>
): ReactElement => {
  return (
    <components.DropdownIndicator {...properties}>
      <Icon height={16} name="arrow" width={16} />
    </components.DropdownIndicator>
  );
};

export { DropdownIndicator };
