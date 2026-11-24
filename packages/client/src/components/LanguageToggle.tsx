import { useI18n } from '../i18n';

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();
  return (
    <div className="language-toggle" role="group" aria-label={t('common.language')}>
      <button type="button" aria-label={t('common.english')} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
      <button type="button" aria-label={t('common.russian')} aria-pressed={language === 'ru'} onClick={() => setLanguage('ru')}>RU</button>
    </div>
  );
}
