import React, { useState, useEffect } from 'react';
import './LeaguesScreen.css';
import { LEAGUE_TIERS, getLeagueTier, buildLeaderboard, getRewardForRank } from '../data/leagues';

const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000; // 24 часа

function LeaguesScreen({
  pet,
  leaguePoints = 0,
  lastClaimed = 0,
  onClaimReward,
  onBack,
}) {
  const [, setTick] = useState(0);
  const currentTier = getLeagueTier(leaguePoints);
  const currentTierIndex = LEAGUE_TIERS.findIndex((t) => t.id === currentTier.id);

  const nextTier = LEAGUE_TIERS[currentTierIndex + 1];
  const progressToNext = nextTier
    ? ((leaguePoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  const leaderboard = buildLeaderboard(pet?.name, pet?.emoji || '🐾', leaguePoints);
  const playerEntry = leaderboard.find((e) => e.isPlayer);
  const playerRank = playerEntry?.rank;

  const myReward = getRewardForRank(playerRank);

  // ==== Проверка времени до следующей награды ====
  const now = Date.now();
  const canClaim = now - lastClaimed >= CLAIM_COOLDOWN;
  const timeLeft = Math.max(0, CLAIM_COOLDOWN - (now - lastClaimed));

  // Тик каждую секунду для обновления таймера
  useEffect(() => {
    if (canClaim) return;
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [canClaim]);

  const formatTimeLeft = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleClaim = () => {
    if (!canClaim) return;
    if (onClaimReward) onClaimReward(myReward);
  };

  return (
    <div className="screen leagues-screen">
      <div className="leagues-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">LEAGUES</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* ==== Пояснение ==== */}
      <div className="league-intro">
        <span className="league-intro-icon">ℹ️</span>
        <span className="league-intro-text">
          Зарабатывай <strong>очки лиги (LP)</strong> за PvP, мини-игры и создание питомцев.
          Чем выше LP — тем выше место в рейтинге.
        </span>
      </div>

      {/* ==== Баннер лиги ==== */}
      <div
        className="league-banner"
        style={{ borderColor: currentTier.color, boxShadow: `0 0 30px ${currentTier.color}40` }}
      >
        <div className="league-badge" style={{ filter: `drop-shadow(0 0 20px ${currentTier.color})` }}>
          {currentTier.icon}
        </div>
        <div className="league-name" style={{ color: currentTier.color, textShadow: `0 0 15px ${currentTier.color}80` }}>
          {currentTier.name}
        </div>
        <div className="league-points-row">
          <span className="league-points-label">Твой LP:</span>
          <span className="league-points-value">{leaguePoints.toLocaleString()}</span>
        </div>

        {nextTier && (
          <>
            <div className="league-progress-wrap">
              <div
                className="league-progress-fill"
                style={{ width: `${Math.min(100, progressToNext)}%`, background: currentTier.color }}
              />
            </div>
            <div className="league-next">
              До {nextTier.name}: <strong>{nextTier.minPoints - leaguePoints} LP</strong>
            </div>
          </>
        )}

        {!nextTier && <div className="league-max">🎉 Ты в топовой лиге!</div>}
      </div>

      {/* ==== Карточка ежедневной награды ==== */}
      <div className={`league-reward-card ${canClaim ? 'available' : 'cooldown'}`}>
        <div className="league-reward-left">
          <div className="league-reward-label">
            🎁 НАГРАДА ЗА #{playerRank}
          </div>
          <div className="league-reward-sub">
            {canClaim ? (
              <>Доступна сейчас</>
            ) : (
              <>Следующая через {formatTimeLeft(timeLeft)}</>
            )}
          </div>
        </div>
        <div className="league-reward-right">
          <span className="league-reward-amount">🪙 {myReward}</span>
          <button
            className={`league-reward-btn ${canClaim ? '' : 'cooldown'}`}
            onClick={handleClaim}
            disabled={!canClaim}
          >
            {canClaim ? 'Забрать' : '⏱'}
          </button>
        </div>
      </div>

      {/* ==== Таблица лидеров — только LP ==== */}
      <div className="leaderboard">
        <div className="leaderboard-header">
          <span>#</span>
          <span></span>
          <span>Игрок</span>
          <span className="lb-col-score">LP</span>
        </div>

        {leaderboard.map((entry) => (
          <div
            key={`${entry.name}_${entry.rank}`}
            className={`leaderboard-row rank-${entry.rank} ${entry.isPlayer ? 'is-player' : ''}`}
          >
            <div className="lb-rank">{entry.rank}</div>
            <div className="lb-emoji">{entry.emoji}</div>
            <div className="lb-name">
              {entry.name}
              {entry.isPlayer && <span className="you-badge">ТЫ</span>}
            </div>
            <div className="lb-score">{entry.points.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* ==== Футер ==== */}
      <div className="league-footer">
        <div className="league-footer-title">🏆 Твой ранг: #{playerRank}</div>
        <div className="league-footer-sub">
          +30 LP за PvP · +20 LP за питомца · +1 LP за 10 очков в Match-3
        </div>
      </div>
    </div>
  );
}

export default LeaguesScreen;