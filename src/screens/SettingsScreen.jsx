import React from 'react';
import './SettingsScreen.css';
import { SUPPORT_PHONE, SUPPORT_PHONE_RAW, SUPPORT_BANK, SBP_URL } from '../data/support';

function SettingsScreen({ music, sound, onBack, onResetProgress, pushToast }) {
  const handleReset = () => {
    if (window.confirm('СБРОСИТЬ ВЕСЬ прогресс? Питомцы, монеты, скины — всё будет удалено.')) {
      if (onResetProgress) onResetProgress();
    }
  };

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPPORT_PHONE_RAW);
      pushToast({
        icon: '📋',
        title: 'Номер скопирован!',
        desc: 'Вставь его в приложении своего банка',
        type: 'success',
      });
    } else {
      pushToast({
        icon: '📋',
        title: SUPPORT_PHONE,
        desc: 'Скопируй номер вручную',
        type: 'info',
      });
    }
  };

  const handleOpenSbp = () => {
    window.open(SBP_URL, '_blank');
    pushToast({
      icon: '💳',
      title: 'Открываю перевод...',
      desc: 'Форма СБП с готовым номером получателя',
      type: 'info',
    });
  };

  return (
    <div className="screen settings-screen">
      <div className="settings-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">SETTINGS</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* ==== Секция звука ==== */}
      <div className="settings-section">
        <div className="settings-section-title">🎵 ЗВУК</div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Фоновая музыка</div>
            <div className="settings-row-desc">Атмосферный эмбиент</div>
          </div>
          <button
            className={`toggle-btn ${music.enabled ? 'on' : 'off'}`}
            onClick={music.toggle}
          >
            {music.enabled ? 'ВКЛ' : 'ВЫКЛ'}
          </button>
        </div>

        {music.enabled && (
          <div className="settings-slider">
            <label className="settings-slider-label">
              Громкость музыки: {Math.round(music.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={music.volume}
              onChange={(e) => music.setVolume(parseFloat(e.target.value))}
              className="slider"
            />
          </div>
        )}

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Звуковые эффекты</div>
            <div className="settings-row-desc">Клики, уведомления</div>
          </div>
          <button
            className={`toggle-btn ${sound?.enabled !== false ? 'on' : 'off'}`}
            onClick={() => sound?.toggle && sound.toggle()}
          >
            {sound?.enabled !== false ? 'ВКЛ' : 'ВЫКЛ'}
          </button>
        </div>
      </div>

      {/* ==== Секция данных ==== */}
      <div className="settings-section">
        <div className="settings-section-title">💾 ДАННЫЕ</div>

        <button className="settings-action-btn danger" onClick={handleReset}>
          🗑 Сбросить весь прогресс
        </button>
        <div className="settings-hint">
          Питомцы, монеты, скины, яйца — всё будет удалено
        </div>
      </div>

      {/* ==== Секция об игре ==== */}
      <div className="settings-section">
        <div className="settings-section-title">ℹ️ ОБ ИГРЕ</div>
        <div className="settings-info">
          <div className="settings-info-row">
            <span>Название</span>
            <span>Neon Tamagotchi</span>
          </div>
          <div className="settings-info-row">
            <span>Версия</span>
            <span>1.0.0</span>
          </div>
          <div className="settings-info-row">
            <span>Дата</span>
            <span>{new Date().toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </div>

      {/* ==== Секция поддержки ==== */}
      <div className="settings-section settings-section-support">
        <div className="settings-section-title">❤️ ПОДДЕРЖАТЬ АВТОРА</div>
        <p className="support-text">
          Игра создана одним разработчиком с любовью. Если хочешь поддержать
          развитие проекта — можно перевести любую сумму через СБП.
        </p>

        <div className="support-phone">
          <span className="support-phone-label">Номер для перевода ({SUPPORT_BANK})</span>
          <span className="support-phone-number">{SUPPORT_PHONE}</span>
        </div>

        <div className="support-actions">
          <button
            className="support-btn support-btn-copy"
            onClick={handleCopyPhone}
          >
            <span className="support-btn-icon">📋</span>
            <span className="support-btn-text">Скопировать номер</span>
          </button>

          <button
            className="support-btn support-btn-sbp"
            onClick={handleOpenSbp}
          >
            <span className="support-btn-icon">💳</span>
            <span className="support-btn-text">Перевести через СБП</span>
          </button>
        </div>

        <div className="support-hint">
          Нажми «Перевести через СБП» — откроется приложение банка с готовым
          номером получателя. Или скопируй номер и вставь в своё приложение.
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;