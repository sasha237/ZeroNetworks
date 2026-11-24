import { useI18n } from '../i18n';

export function Logo({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`logo${compact ? ' compact' : ''}`} aria-label={t('logo.label')}>
      <svg viewBox="0 0 64 72" aria-hidden="true">
        <defs>
          <linearGradient id="logo-split" x1="0" x2="1">
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#f87171" />
          </linearGradient>
        </defs>
        <path d="M32 3 59 18v36L32 69 5 54V18Z" fill="none" stroke="url(#logo-split)" strokeWidth="3" />
        <path d="M32 12 51 23v26L32 60 13 49V23Z" fill="rgba(34,211,238,.07)" stroke="rgba(230,237,243,.35)" />
        <path d="M20 37c7-18 23-15 26-4-8-5-13 1-10 8 3 8-5 13-13 8" fill="none" stroke="url(#logo-split)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="20" cy="37" r="4" fill="#e6edf3" />
      </svg>
      {!compact && (
        <span className="logo-type">
          <strong>{t('logo.dark')}</strong>
          <span>{t('logo.networks')}</span>
        </span>
      )}
    </div>
  );
}
