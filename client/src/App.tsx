import { useState } from 'react';
import { StartPage } from './components/StartPage/StartPage';
import type { PlayerIcon } from './components/StartPage/StartPage';
import { MazePage } from './components/MazePage/MazePage';
import './theme.css';

type AppView = 'start' | 'maze';

export default function App() {
  const [view, setView] = useState<AppView>('start');
  const [playerIcon, setPlayerIcon] = useState<PlayerIcon>('cat');

  const handleExplore = (icon: PlayerIcon) => {
    setPlayerIcon(icon);
    setView('maze');
  };

  return (
    <>
      {view === 'start' && <StartPage onExplore={handleExplore} />}
      {view === 'maze' && <MazePage playerIcon={playerIcon} onExit={() => setView('start')} />}
    </>
  );
}
