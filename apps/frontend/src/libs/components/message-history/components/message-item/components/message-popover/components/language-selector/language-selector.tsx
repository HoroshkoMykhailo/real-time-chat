import { Select } from '~/libs/components/components.js';
import { useAppForm, useEffect } from '~/libs/hooks/hooks.js';
import { type ValueOf } from '~/libs/types/types.js';
import { MessageLanguage } from '~/modules/messages/message.js';

import styles from './styles.module.scss';

type Properties = {
  onLanguageChange: (languageCode: ValueOf<typeof MessageLanguage>) => void;
};

const LanguageSelector = ({ onLanguageChange }: Properties): JSX.Element => {
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
    <div className={styles['language-selector']}>
      <Select
        control={control}
        name="language"
        options={[
          { label: 'English', value: MessageLanguage.ENGLISH },
          { label: 'Ukrainian', value: MessageLanguage.UKRAINIAN }
        ]}
        placeholder="Select language"
      />
    </div>
  );
};

export { LanguageSelector };
