import React, { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import CreatePetScreen from './screens/CreatePetScreen';
import MyPetsScreen from './screens/MyPetsScreen';
import PetProfileScreen from './screens/PetProfileScreen';
import FeedScreen from './screens/FeedScreen';
import MiniGameScreen from './screens/MiniGameScreen';
import PvpScreen from './screens/PvpScreen';
import ShopScreen from './screens/ShopScreen';
import LeaguesScreen from './screens/LeaguesScreen';
import EventsScreen from './screens/EventsScreen';
import CatchGameScreen from './screens/CatchGameScreen';
import CareScreen from './screens/CareScreen';
import HatchScreen from './screens/HatchScreen';
import SettingsScreen from './screens/SettingsScreen';
import Toast from './components/Toast';
import InteractiveBackground from './components/InteractiveBackground';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePetDecay } from './hooks/usePetDecay';
import { useEggTimer } from './hooks/useEggTimer';
import { useMusic } from './hooks/useMusic';
import { EGG_TIERS, rollSpeciesByTier, createPetStats } from './data/pets';
import { FOODS } from './data/foods';
import { BOOSTS, SKINS } from './data/shopItems';
import { useSoundEffects } from './hooks/useSoundEffects';

function App() {
  const [pets, setPets] = useLocalStorage('tama_pets', []);
  const [eggs, setEggs] = useLocalStorage('tama_eggs', []);
  const [coins, setCoins] = useLocalStorage('tama_coins', 500);
  const [activePetId, setActivePetId] = useLocalStorage('tama_activePet', null);
  const [inventory, setInventory] = useLocalStorage('tama_inventory', {});
  const [ownedSkins, setOwnedSkins] = useLocalStorage('tama_ownedSkins', ['default']);
  const [activeSkin, setActiveSkin] = useLocalStorage('tama_activeSkin', 'default');
  const [leaguePoints, setLeaguePoints] = useLocalStorage('tama_leaguePoints', 0);
  const [leagueLastClaimed, setLeagueLastClaimed] = useLocalStorage('tama_leagueLastClaim', 0);

  const [screen, setScreen] = useState(pets.length === 0 && eggs.length === 0 ? 'create' : 'list');
  const [toasts, setToasts] = useState([]);
  const [careMode, setCareMode] = useState('sleep');
  const [pendingHatch, setPendingHatch] = useState(null);

  const prevScreenRef = useRef('list');

  // ==== Музыка ====
  const music = useMusic();
  const soundEffects = useSoundEffects();

  const pushToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  usePetDecay(pets, setPets);

  // ==== Автозапуск музыки при первом взаимодействии ====
  useEffect(() => {
    if (!music.enabled) return;
    let started = false;

    const startMusic = () => {
      if (started) return;
      started = true;
      music.start();
      window.removeEventListener('click', startMusic);
      window.removeEventListener('touchstart', startMusic);
      window.removeEventListener('keydown', startMusic);
    };

    window.addEventListener('click', startMusic);
    window.addEventListener('touchstart', startMusic);
    window.addEventListener('keydown', startMusic);

    return () => {
      window.removeEventListener('click', startMusic);
      window.removeEventListener('touchstart', startMusic);
      window.removeEventListener('keydown', startMusic);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music.enabled]);

  // ==== Яйцо созрело → открываем экран вылупления ====
  const handleEggHatch = useCallback((eggId) => {
    const egg = eggs.find((e) => e.id === eggId);
    if (!egg) return;

    const species = rollSpeciesByTier(egg.tier);
    const stats = createPetStats();
    const newPet = {
      id: `pet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: '',
      speciesId: species.id,
      speciesName: species.name,
      emoji: species.emoji,
      color: species.color,
      rarity: species.rarity,
      description: species.description,
      ...stats,
      coins: 50,
      createdAt: Date.now(),
    };

    setPendingHatch({ egg, pet: newPet });
    setScreen('hatch');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eggs]);

  // ==== Подтверждение имени ====
  const confirmHatch = (name) => {
    if (!pendingHatch) return;
    const { egg, pet } = pendingHatch;

    const finalPet = { ...pet, name };

    setPets((prev) => [...prev, finalPet]);
    setEggs((prev) => prev.filter((e) => e.id !== egg.id));
    setPendingHatch(null);
    setActivePetId(finalPet.id);
    setLeaguePoints((p) => p + 20);

    pushToast({
      icon: '🥚',
      title: 'Яйцо вылупилось!',
      desc: `${finalPet.emoji} ${finalPet.name}`,
      type: 'success',
    });

    setScreen('list');
  };

  useEggTimer(eggs, handleEggHatch);

  const goTo = (s, remember = true) => {
    if (remember) prevScreenRef.current = screen;
    setScreen(s);
  };

  const goBack = () => setScreen(prevScreenRef.current);

  const addPet = (pet) => {
    setPets((prev) => [...prev, pet]);
    setActivePetId(pet.id);
    setScreen('list');
    setLeaguePoints((p) => p + 20);
    pushToast({ icon: '🥚', title: 'Питомец создан!', desc: pet.name, type: 'success' });
  };

  const updatePet = (id, updater) => {
    setPets((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...(typeof updater === 'function' ? updater(p) : updater) }
          : p
      )
    );
  };

  const removePet = (id) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
    if (activePetId === id) setActivePetId(null);
  };

  const buyEgg = (tier) => {
    const tierData = EGG_TIERS[tier];
    if (!tierData) return;
    if (coins < tierData.price) {
      pushToast({ icon: '💸', title: 'Недостаточно монет', desc: `Нужно ${tierData.price}`, type: 'info' });
      return;
    }
    setCoins((c) => c - tierData.price);
    const newEgg = {
      id: `egg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tier,
      name: tierData.name,
      createdAt: Date.now(),
      readyAt: Date.now() + tierData.hatchTime,
      hatched: false,
    };
    setEggs((prev) => [...prev, newEgg]);
    pushToast({
      icon: '🥚',
      title: 'Куплено яйцо!',
      desc: `${tierData.name} · ${tierData.stars}`,
      type: 'success',
    });
  };

  const buyFood = (foodId) => {
    const food = FOODS.find((f) => f.id === foodId);
    if (!food) return;
    if (coins < food.cost) {
      pushToast({ icon: '💸', title: 'Недостаточно монет', desc: `Нужно ${food.cost}`, type: 'info' });
      return;
    }
    setCoins((c) => c - food.cost);
    setInventory((inv) => ({ ...inv, [foodId]: (inv[foodId] || 0) + 1 }));
    pushToast({
      icon: food.emoji,
      title: `${food.name} куплен`,
      desc: `В инвентаре: ${(inventory[foodId] || 0) + 1}`,
      type: 'success',
    });
  };

  const buyBoost = (boostId) => {
    const boost = BOOSTS.find((b) => b.id === boostId);
    if (!boost) return;
    if (coins < boost.price) {
      pushToast({ icon: '💸', title: 'Недостаточно монет', desc: `Нужно ${boost.price}`, type: 'info' });
      return;
    }
    setCoins((c) => c - boost.price);
    pushToast({ icon: boost.emoji, title: `${boost.name} активирован`, desc: boost.description, type: 'success' });
  };

  const buySkin = (skinId) => {
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin) return;
    if (coins < skin.price) {
      pushToast({ icon: '💸', title: 'Недостаточно монет', desc: `Нужно ${skin.price}`, type: 'info' });
      return;
    }
    setCoins((c) => c - skin.price);
    setOwnedSkins((prev) => [...prev, skinId]);
    setActiveSkin(skinId);
    pushToast({ icon: '🎨', title: `${skin.name} куплен!`, desc: 'Скин активирован', type: 'success' });
  };

  const equipSkin = (skinId) => {
    if (!ownedSkins.includes(skinId)) return;
    setActiveSkin(skinId);
    pushToast({ icon: '🎨', title: 'Скин надет', type: 'success' });
  };

  // ==== Сброс прогресса ====
  const resetProgress = () => {
    localStorage.clear();
    window.location.reload();
  };

  // ==== Награды за PvP ====
  const addPvpReward = (xp, coinsReward) => {
    setCoins((c) => c + coinsReward);
    setLeaguePoints((p) => p + 30);
    if (activePetId) {
      updatePet(activePetId, (p) => ({ ...p, xp: p.xp + xp }));
    }
    pushToast({
      icon: '🪙',
      title: `+${coinsReward} монет`,
      desc: `+${xp} XP · +30 очков лиги`,
      type: 'success',
    });
  };

  const activePet = pets.find((p) => p.id === activePetId);

  const handleNavChange = (navId) => {
    switch (navId) {
      case 'shop':     goTo('shop');     break;
      case 'leagues':  goTo('leagues');  break;
      case 'play':     goTo('minigame'); break;
      case 'events':   goTo('events');   break;
      case 'pets':     goTo('list');     break;
      case 'settings': goTo('settings'); break;
      default: break;
    }
  };

  return (
    <div className="app">
      <InteractiveBackground />
      <div className="app-bg-stars"></div>

      {screen === 'create' && (
        <CreatePetScreen
          onCreate={addPet}
          onBack={() => (pets.length > 0 || eggs.length > 0) && goTo('list')}
        />
      )}

      {screen === 'list' && (
        <MyPetsScreen
          pets={pets}
          eggs={eggs}
          activeSkin={activeSkin}
          onSelectPet={(id) => { setActivePetId(id); goTo('profile'); }}
          onAddNew={() => goTo('create')}
          onOpenShop={() => goTo('shop')}
          onNavChange={handleNavChange}
        />
      )}

      {screen === 'profile' && activePet && (
        <PetProfileScreen
          pet={activePet}
          activeSkin={activeSkin}
          onBack={() => goTo('list')}
          onFeed={() => goTo('feed')}
          onPlay={() => goTo('minigame')}
          onPvp={() => goTo('pvp')}
          onCatchGame={() => goTo('catchgame')}
          onSleep={() => { setCareMode('sleep'); goTo('care'); }}
          onWash={() => { setCareMode('wash'); goTo('care'); }}
          onUpdate={(updater) => updatePet(activePetId, updater)}
          onDelete={() => { removePet(activePetId); goTo('list'); }}
          pushToast={pushToast}
          onNavChange={handleNavChange}
        />
      )}

      {screen === 'feed' && activePet && (
        <FeedScreen
          pet={activePet}
          activeSkin={activeSkin}
          inventory={inventory}
          setInventory={setInventory}
          onBack={() => goTo('profile')}
          onUpdate={(updater) => updatePet(activePetId, updater)}
          pushToast={pushToast}
        />
      )}

      {screen === 'care' && activePet && (
        <CareScreen
          pet={activePet}
          activeSkin={activeSkin}
          initialMode={careMode}
          onBack={() => goTo('profile')}
          onUpdate={(updater) => updatePet(activePetId, updater)}
          pushToast={pushToast}
        />
      )}

      {screen === 'minigame' && activePet && (
        <MiniGameScreen
          pet={activePet}
          activeSkin={activeSkin}
          onBack={() => goTo('profile')}
          onReward={(xp, coinsReward, score) => {
            updatePet(activePetId, (p) => ({
              ...p,
              xp: p.xp + xp,
              happiness: Math.min(100, p.happiness + 15),
            }));
            setCoins((c) => c + coinsReward);
            setLeaguePoints((p) => p + Math.floor((score || 0) / 10));
            pushToast({ icon: '🏆', title: `+${coinsReward} монет`, desc: `+${xp} XP`, type: 'success' });
            goTo('profile');
          }}
        />
      )}

      {screen === 'catchgame' && activePet && (
        <CatchGameScreen
          pet={activePet}
          activeSkin={activeSkin}
          onBack={() => goTo('profile')}
          onReward={({ coins: c, xp, hunger, happiness, score }) => {
            setCoins((prev) => prev + c);
            setLeaguePoints((p) => p + Math.floor((score || 0) / 5));
            updatePet(activePetId, (p) => ({
              ...p,
              xp: p.xp + xp,
              hunger: Math.max(0, Math.min(100, p.hunger + hunger)),
              happiness: Math.max(0, Math.min(100, p.happiness + happiness)),
            }));
            pushToast({
              icon: '🎮',
              title: `+${c} монет`,
              desc: `+${xp} XP · 🍖 ${hunger >= 0 ? '+' : ''}${hunger} · 😊 ${happiness >= 0 ? '+' : ''}${happiness}`,
              type: 'success',
            });
            goTo('profile');
          }}
        />
      )}

      {screen === 'pvp' && activePet && (
        <PvpScreen
          pet={activePet}
          activeSkin={activeSkin}
          onBack={() => goTo('profile')}
          onReward={addPvpReward}
        />
      )}

      {screen === 'shop' && (
        <ShopScreen
          coins={coins}
          eggs={eggs}
          inventory={inventory}
          ownedSkins={ownedSkins}
          activeSkin={activeSkin}
          onBuyEgg={buyEgg}
          onBuyFood={buyFood}
          onBuyBoost={buyBoost}
          onBuySkin={buySkin}
          onEquipSkin={equipSkin}
          onBack={goBack}
        />
      )}

      {screen === 'leagues' && (
        <LeaguesScreen
          pet={activePet}
          leaguePoints={leaguePoints}
          lastClaimed={leagueLastClaimed}
          onClaimReward={(reward) => {
            setCoins((c) => c + reward);
            setLeagueLastClaimed(Date.now());
            pushToast({
              icon: '🏆',
              title: `+${reward} монет!`,
              desc: 'Награда лиги получена',
              type: 'success',
            });
          }}
          onBack={goBack}
        />
      )}

      {screen === 'events' && (
        <EventsScreen onBack={goBack} />
      )}

      {screen === 'settings' && (
  <SettingsScreen
    music={music}
    sound={soundEffects}
    onBack={goBack}
    onResetProgress={resetProgress}
    pushToast={pushToast}
  />
)}

      {screen === 'hatch' && pendingHatch && (
        <HatchScreen
          egg={pendingHatch.egg}
          pet={pendingHatch.pet}
          activeSkin={activeSkin}
          onConfirm={confirmHatch}
          onBack={() => {
            confirmHatch(pendingHatch.pet.speciesName || 'Питомец');
          }}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}

export default App;