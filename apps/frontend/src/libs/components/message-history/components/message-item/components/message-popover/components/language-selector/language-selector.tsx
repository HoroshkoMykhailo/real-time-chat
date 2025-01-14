import { Select } from '~/libs/components/components.js';
import { useAppForm, useEffect } from '~/libs/hooks/hooks.js';
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
  const { control, handleSubmit, watch } = useAppForm<{
    language: ValueOf<typeof MessageLanguage> | null;
  }>({
    defaultValues: { language: null }
  });

  const selectedLanguage = watch('language');

  useEffect(() => {
    if (selectedLanguage) {
      onLanguageChange(selectedLanguage);
    }
  }, [selectedLanguage, handleSubmit, onLanguageChange]);

  return (
    <Select
      control={control}
      name="language"
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
