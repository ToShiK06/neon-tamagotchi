import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PvpScreen.css';
import NeonButton from '../components/NeonButton';
import ProgressBar from '../components/ProgressBar';
import PetSprite from '../components/PetSprite';
import DamagePopup from '../components/DamagePopup';
import { getRandomArena } from '../data/arenas';

// Противники — сложнее с каждым уровнем
const OPPONENTS = [
  { speciesId: 'fox',   name: 'ShadowFox', rank: 'Bronze',   level: 1,  hp: 180, reward: 20,  attackMin: 6,  attackMax: 10 },
  { speciesId: 'wolf',  name: 'NeonWolf',  rank: 'Silver',   level: 3,  hp: 260, reward: 40,  attackMin: 9,  attackMax: 14 },
  { speciesId: 'kuro',  name: 'AquaCat',   rank: 'Gold',     level: 6,  hp: 350, reward: 70,  attackMin: 13, attackMax: 19 },
  { speciesId: 'ghost', name: 'VoidBear',  rank: 'Platinum', level: 10, hp: 480, reward: 120, attackMin: 17, attackMax: 25 },
  { speciesId: 'phoen', name: 'Pyra',      rank: 'Diamond',  level: 15, hp: 620, reward: 200, attackMin: 22, attackMax: 32 },
  { speciesId: 'draco', name: 'Draco',     rank: 'Master',   level: 20, hp: 800, reward: 350, attackMin: 28, attackMax: 40 },
];

const MAX_ULT = 100;

function PvpScreen({ pet, activeSkin = 'default', onBack, onReward }) {
  const [opponent, setOpponent] = useState(null);
  const [arena, setArena] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [battleState, setBattleState] = useState('searching');
  const [myHp, setMyHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [myMaxHp, setMyMaxHp] = useState(100);
  const [enemyMaxHp, setEnemyMaxHp] = useState(100);
  const [ult, setUlt] = useState(0); // 0–100
  const [myAnim, setMyAnim] = useState('idle');
  const [enemyAnim, setEnemyAnim] = useState('idle');
  const [damages, setDamages] = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [ultFlash, setUltFlash] = useState(false);
  const battleLoopRef = useRef(null);
  const idRef = useRef(0);
  const logRef = useRef(null);

  // ==== Поиск противника ====
  useEffect(() => {
    const t = setTimeout(() => {
      // Уровень противника зависит от уровня игрока
      const playerLevel = pet.level || 1;
      // Выбираем из тех, кто примерно равен уровню игрока
      const suitable = OPPONENTS.filter((o) => Math.abs(o.level - playerLevel) <= 3);
      const pool = suitable.length > 0 ? suitable : [OPPONENTS[0]];
      const opp = pool[Math.floor(Math.random() * pool.length)];

      setOpponent(opp);
      setArena(getRandomArena());
      const playerMaxHp = 250 + (pet.level || 1) * 15;
setMyMaxHp(playerMaxHp);
setMyHp(playerMaxHp);
      setEnemyMaxHp(opp.hp);
      setEnemyHp(opp.hp);
      setUlt(0);
      setBattleState('countdown');
    }, 1500);
    return () => clearTimeout(t);
  }, [pet.level]);

  // ==== Обратный отсчёт ====
  useEffect(() => {
    if (battleState !== 'countdown') return;
    if (countdown <= 0) { setBattleState('battle'); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [battleState, countdown]);

  // ==== Лог ====
  const addLog = useCallback((msg, type = 'info') => {
    setBattleLog((prev) => [...prev.slice(-4), { id: Date.now() + Math.random(), msg, type }]);
  }, []);

  // ==== Всплывающий урон ====
  const popDamage = useCallback((dmg, side, isCrit) => {
    const id = ++idRef.current;
    setDamages((prev) => [...prev, { id, dmg, isCrit, side }]);
    setTimeout(() => setDamages((prev) => prev.filter((d) => d.id !== id)), 1200);
  }, []);

  // ==== Атака игрока ====
  const playerAttack = useCallback((myHpLocal, enemyHpLocal) => {
    const myCrit = Math.random() < 0.2;
    const baseDamage = 8 + Math.random() * 8 + pet.level * 0.7;
    const myDamage = baseDamage * (myCrit ? 2 : 1);
    const newEnemyHp = Math.max(0, enemyHpLocal - myDamage);

    setMyAnim('attack');
    popDamage(myDamage, 'my', myCrit);
    addLog(`${pet.name} бьёт на ${Math.round(myDamage)}${myCrit ? ' КРИТ!' : ''}`, myCrit ? 'crit' : 'player');

    // Ульта копится быстрее — 1 урон = 1.5%
setUlt((u) => Math.min(MAX_ULT, u + myDamage * 1.5));

    setTimeout(() => setEnemyAnim('hit'), 200);
    setTimeout(() => setEnemyAnim('idle'), 500);
    setTimeout(() => setMyAnim('idle'), 500);

    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 250);
    setEnemyHp(newEnemyHp);

    return newEnemyHp;
  }, [pet.name, pet.level, popDamage, addLog]);

  // ==== Атака противника ====
  const enemyAttack = useCallback((myHpLocal, opp) => {
    const enemyCrit = Math.random() < 0.15;
    const baseDamage = opp.attackMin + Math.random() * (opp.attackMax - opp.attackMin);
    const enemyDamage = baseDamage * (enemyCrit ? 2 : 1);
    const newMyHp = Math.max(0, myHpLocal - enemyDamage);

    setEnemyAnim('attack');
    popDamage(enemyDamage, 'enemy', enemyCrit);
    addLog(`${opp.name} бьёт на ${Math.round(enemyDamage)}${enemyCrit ? ' КРИТ!' : ''}`, enemyCrit ? 'critEnemy' : 'enemy');

    setTimeout(() => setMyAnim('hit'), 200);
    setTimeout(() => setMyAnim('idle'), 500);
    setTimeout(() => setEnemyAnim('idle'), 500);

    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 250);
    setMyHp(newMyHp);

    return newMyHp;
  }, [popDamage, addLog]);

  // ==== Бой ====
  useEffect(() => {
    if (battleState !== 'battle' || !opponent) return;

    let myHpLocal = myMaxHp;
    let enemyHpLocal = enemyMaxHp;

    const tick = () => {
      // Атака игрока
      enemyHpLocal = playerAttack(myHpLocal, enemyHpLocal);

      if (enemyHpLocal <= 0) {
        setTimeout(() => {
          setBattleState('result');
          setMyAnim('victory');
          setEnemyAnim('defeated');
          addLog('ПОБЕДА!', 'win');
        }, 600);
        return;
      }

      // Атака противника через задержку
      setTimeout(() => {
        if (enemyHpLocal <= 0) return;
        myHpLocal = enemyAttack(myHpLocal, opponent);

        if (myHpLocal <= 0) {
          setTimeout(() => {
            setBattleState('result');
            setMyAnim('defeated');
            setEnemyAnim('victory');
            addLog('ПОРАЖЕНИЕ...', 'lose');
          }, 600);
        }
      }, 450);
    };

    battleLoopRef.current = setInterval(tick, 1400);
    return () => clearInterval(battleLoopRef.current);
  }, [battleState, opponent, myMaxHp, enemyMaxHp, playerAttack, enemyAttack, addLog]);

  // ==== УЛЬТА ====
  const useUltimate = () => {
    if (battleState !== 'battle' || ult < MAX_ULT) return;

    setUlt(0);
    setUltFlash(true);
    setTimeout(() => setUltFlash(false), 800);

    // Урон ×5
    const ultDamage = (25 + pet.level * 2) * 5;
    const newEnemyHp = Math.max(0, enemyHp - ultDamage);

    // Лечение 30% от макс HP
    const heal = Math.floor(myMaxHp * 0.3);
    const newMyHp = Math.min(myMaxHp, myHp + heal);

    popDamage(ultDamage, 'my', true);
    addLog(`⚡ УЛЬТА! ${Math.round(ultDamage)} урона · +${heal} HP`, 'ult');

    setMyAnim('attack');
    setEnemyAnim('hit');
    setShakeScreen(true);
    setTimeout(() => { setMyAnim('idle'); setEnemyAnim('idle'); setShakeScreen(false); }, 600);

    setEnemyHp(newEnemyHp);
    setMyHp(newMyHp);

    if (newEnemyHp <= 0) {
      setTimeout(() => {
        setBattleState('result');
        setMyAnim('victory');
        setEnemyAnim('defeated');
        addLog('ПОБЕДА!', 'win');
      }, 600);
    }
  };

  // ==== Награда ====
  const claimReward = () => {
    const won = enemyHp <= 0;
    if (won && opponent && onReward) {
      const totalReward = Math.floor(opponent.reward * (arena?.rewardMultiplier || 1));
      onReward(50 + opponent.level * 5, totalReward);
    }
    onBack();
  };

  return (
    <div className={`screen pvp-screen ${shakeScreen ? 'screen-shake' : ''} ${ultFlash ? 'ult-flash' : ''}`}>
      <div className="pvp-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">PVP ARENA</h1>
        <div style={{ width: 40 }} />
      </div>

      {battleState === 'searching' && (
        <div className="pvp-searching">
          <div className="pvp-radar"></div>
          <p className="pvp-status">Поиск противника...</p>
        </div>
      )}

      {battleState === 'countdown' && opponent && arena && (
        <div className={`pvp-arena-bg ${arena.className}`}>
          <div className="arena-badge">
            <span className="arena-badge-icon">{arena.icon}</span>
            <span className="arena-badge-name">{arena.name}</span>
          </div>

          {/* Декор арены */}
          <div className="arena-decor">
            <div className="arena-decor-item d1"></div>
            <div className="arena-decor-item d2"></div>
            <div className="arena-decor-item d3"></div>
          </div>

          <div className="pvp-battle-row">
            <div className="pvp-side my-side">
              <div className={`pvp-pet-slot ${myAnim}`}>
                <PetSprite speciesId={pet.speciesId} size={90} skin={activeSkin} mood="idle" />
              </div>
              <div className="pvp-pet-name">{pet.name}</div>
              <div className="pvp-pet-rank">Lv. {pet.level}</div>
            </div>

            <div className="pvp-vs">VS</div>

            <div className="pvp-side enemy-side">
              <div className={`pvp-pet-slot ${enemyAnim}`}>
                <PetSprite speciesId={opponent.speciesId} size={90} skin="default" mood="idle" />
              </div>
              <div className="pvp-pet-name">{opponent.name}</div>
              <div className="pvp-pet-rank">{opponent.rank} · Lv. {opponent.level}</div>
            </div>
          </div>

          <div className="pvp-countdown">
            Starting in <strong>{countdown}s</strong>
          </div>
        </div>
      )}

      {(battleState === 'battle' || battleState === 'result') && opponent && arena && (
        <div className={`pvp-arena-bg ${arena.className}`}>
          <div className="arena-badge">
            <span className="arena-badge-icon">{arena.icon}</span>
            <span className="arena-badge-name">{arena.name}</span>
            {arena.rewardMultiplier > 1 && (
              <span className="arena-badge-bonus">×{arena.rewardMultiplier} награда</span>
            )}
          </div>

          <div className="arena-decor">
            <div className="arena-decor-item d1"></div>
            <div className="arena-decor-item d2"></div>
            <div className="arena-decor-item d3"></div>
          </div>

          {/* HP бары */}
          <div className="pvp-battle-row">
            <div className="pvp-side my-side">
              <div className={`pvp-pet-slot ${myAnim}`}>
                <PetSprite speciesId={pet.speciesId} size={90} skin={activeSkin} mood={myAnim} />
              </div>
              <div className="pvp-pet-name">{pet.name}</div>
              <ProgressBar value={myHp} max={myMaxHp} color="green" showText />
            </div>

            <div className="pvp-vs">VS</div>

            <div className="pvp-side enemy-side">
              <div className={`pvp-pet-slot ${enemyAnim}`}>
                <PetSprite speciesId={opponent.speciesId} size={90} skin="default" mood={enemyAnim} />
              </div>
              <div className="pvp-pet-name">{opponent.name}</div>
              <ProgressBar value={enemyHp} max={enemyMaxHp} color="pink" showText />
            </div>
          </div>

          {/* Ульта */}
          {battleState === 'battle' && (
            <div className="ult-block">
              <div className="ult-bar-wrap">
                <div className="ult-bar-fill" style={{ width: `${ult}%` }} />
                <span className="ult-bar-text">
                  ⚡ УЛЬТА {Math.floor(ult)}%
                </span>
              </div>
              <button
                className={`ult-btn ${ult >= MAX_ULT ? 'ready' : ''}`}
                onClick={useUltimate}
                disabled={ult < MAX_ULT}
              >
                {ult >= MAX_ULT ? '⚡ УДАР!' : 'Заряжается...'}
              </button>
            </div>
          )}

          {/* Лог боя */}
          <div className="battle-log" ref={logRef}>
            {battleLog.slice(-3).map((entry) => (
              <div key={entry.id} className={`log-entry log-${entry.type}`}>
                {entry.msg}
              </div>
            ))}
          </div>

          {/* Всплывающий урон */}
          <div className="pvp-damage-layer">
            {damages.map((d) => (
              <DamagePopup
                key={d.id}
                damage={d.dmg}
                x={d.side === 'my' ? '25%' : '75%'}
                y="30%"
                isCrit={d.isCrit}
                isEnemy={d.side === 'my'}
              />
            ))}
          </div>

          {battleState === 'result' && (
            <div className={`pvp-result ${enemyHp <= 0 ? 'win' : 'lose'}`}>
              {enemyHp <= 0 ? (
                <>
                  <h2>🏆 ПОБЕДА!</h2>
                  <p>Ты победил <strong>{opponent.name}</strong></p>
                  <p>Награда: <strong>🪙 +{Math.floor(opponent.reward * (arena?.rewardMultiplier || 1))}</strong></p>
                </>
              ) : (
                <>
                  <h2>💀 ПОРАЖЕНИЕ</h2>
                  <p>Ты проиграл <strong>{opponent.name}</strong></p>
                  <p>Награда: <strong>🪙 +0</strong></p>
                </>
              )}
              <NeonButton variant="primary" size="lg" fullWidth onClick={claimReward} icon="✓">
                {enemyHp <= 0 ? 'Забрать награду' : 'Вернуться'}
              </NeonButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PvpScreen;