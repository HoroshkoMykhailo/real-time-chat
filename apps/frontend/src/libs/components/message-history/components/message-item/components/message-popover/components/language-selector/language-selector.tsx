import { Select } from '~/libs/components/components.js';
import { useAppForm, useCallback } from '~/libs/hooks/hooks.js';
import { translate } from '~/libs/modules/localization/translate.js';
import { type ValueOf } from '~/libs/types/types.js';
import { MessageLanguage } from '~/modules/messages/message.js';
import { type ProfileLanguage } from '~/modules/profile/libs/types/types.js';

type Properties = {
  language: ValueOf<typeof ProfileLanguage>;
  onLanguageChange: (languageCode: ValueOf<typeof MessageLanguage>) => void;
};

const LanguageSelector = ({
  language,
  onLanguageChange
}: Properties): JSX.Element => {
  const { control } = useAppForm<{
    language: null | ValueOf<typeof MessageLanguage>;
  }>({
    defaultValues: { language: null }
  });

  const handleLanguageChosen = useCallback(
    (code: null | ValueOf<typeof MessageLanguage>): void => {
      if (code) {
        onLanguageChange(code);
      }
    },
    [onLanguageChange]
  );

  return (
    <Select
      control={control}
      name="language"
      onSingleValueChange={handleLanguageChosen}
      options={[
        {
          label: translate.translate('english', language),
          value: MessageLanguage.ENGLISH
        },
        {
          label: translate.translate('ukrainian', language),
          value: MessageLanguage.UKRAINIAN
        }
      ]}
      placeholder={translate.translate('selectLanguage', language)}
    />
  );
};

export { LanguageSelector };
