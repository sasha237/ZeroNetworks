import type { Mode } from '../game/store';
import { useI18n } from '../i18n';
import { LanguageToggle } from './LanguageToggle';
import { Logo } from './Logo';

export function ModeScreen({ onStart, onHelp, onMenu }: { onStart: (mode: Mode) => void; onHelp: () => void; onMenu: () => void }) {
  const { t } = useI18n();
  return (
    <main className="mode-screen">
      <div className="mode-ambient" aria-hidden="true" />
      <div className="mode-toolbar">
        <button className="ghost-btn" onClick={onHelp} aria-label={t('common.openRules')}>?</button>
        <LanguageToggle />
        <button className="ghost-btn" onClick={onMenu}>{t('common.menu')}</button>
      </div>
      <section className="mode-card">
        <Logo />
        <p className="eyebrow">{t('mode.tagline')}</p>
        <h1>{t('mode.titlePower')}<br />{t('mode.titleSurvival')}</h1>
        <p className="mode-intro">{t('mode.intro')}</p>
        <div className="mode-options">
          <button className="mode-option blue" onClick={() => onStart('ai-blue')}>
            <span className="mode-kicker">{t('mode.singlePlayer')}</span>
            <strong>{t('mode.playState')}</strong>
            <span>{t('mode.playStateDescription')}</span>
          </button>
          <button className="mode-option red" onClick={() => onStart('ai-red')}>
            <span className="mode-kicker">{t('mode.singlePlayer')}</span>
            <strong>{t('mode.playNetwork')}</strong>
            <span>{t('mode.playNetworkDescription')}</span>
          </button>
          <button className="mode-option neutral" onClick={() => onStart('hotseat')}>
            <span className="mode-kicker">{t('mode.twoPlayers')}</span>
            <strong>{t('mode.hotseat')}</strong>
            <span>{t('mode.hotseatDescription')}</span>
          </button>
        </div>
        <button className="text-button" onClick={onHelp}>{t('mode.readRules')}</button>
        <p className="version-label">{t('mode.version')}</p>
      </section>
    </main>
  );
}
