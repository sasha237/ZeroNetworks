import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n';

export function HelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label={t('common.closeRules')}>×</button>
        <span className="eyebrow">{t('help.restored')}</span>
        <h1 id="help-title">{t('help.title')}</h1>
        <div className="help-content">
          <section><h2>{t('help.campaign')}</h2><p>{t('help.campaignText')}</p></section>
          <section><h2>{t('help.balance')}</h2><p>{t('help.balanceText')}</p></section>
          <section><h2>{t('help.blue')}</h2><p>{t('help.blueText')}</p><p>{t('help.blueText2')}</p></section>
          <section><h2>{t('help.red')}</h2><p>{t('help.redText')}</p></section>
          <section><h2>{t('help.resources')}</h2><p>{t('help.resourcesText')}</p></section>
          <section><h2>{t('help.victory')}</h2><p>{t('help.victoryText')}</p></section>
          <section className="house-note"><h2>{t('help.restoration')}</h2><p>{t('help.restorationText')} <code>Zero Networks Rules.md</code>.</p></section>
        </div>
      </section>
    </div>
  );
}
