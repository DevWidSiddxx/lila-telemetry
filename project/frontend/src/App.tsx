import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';

export interface MatchData {
  match_id: string;
  map_id: string;
  events: PlayerEvent[];
}

export interface PlayerEvent {
  user_id: string;
  is_bot: boolean;
  x: number;
  y: number;
  z: number;
  event: string;
  time: number; // relative ms
}

function App() {
  const [meta, setMeta] = useState<any>(null);
  const [selectedMap, setSelectedMap] = useState<string>('AmbroseValley');
  const [selectedDate, setSelectedDate] = useState<string>('2026-02-10');
  const [matches, setMatches] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [maxTime, setMaxTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [layersConfig, setLayersConfig] = useState({
    showPlayers: true,
    showBots: true,
    showKills: true,
    showDeaths: true,
    showLoot: false,
    heatmap: 'none' // 'none', 'kills', 'deaths', 'traffic'
  });

  // Fetch metadata on load
  useEffect(() => {
    fetch('http://localhost:8000/api/meta')
      .then(res => res.json())
      .then(data => {
        setMeta(data);
        if (data.dates?.length > 0) setSelectedDate(data.dates[0]);
      })
      .catch(console.error);
  }, []);

  // Fetch matches when map or date changes
  useEffect(() => {
    if (!selectedMap || !selectedDate) return;
    
    fetch(`http://localhost:8000/api/matches?map_id=${selectedMap}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setMatches(data.matches);
        if (data.matches.length > 0) {
          setSelectedMatch(data.matches[0]);
        } else {
          setSelectedMatch('');
          setMatchData(null);
        }
      })
      .catch(console.error);
  }, [selectedMap, selectedDate]);

  // Fetch match data when selected match changes
  useEffect(() => {
    if (!selectedMatch) return;
    
    fetch(`http://localhost:8000/api/events/${selectedMatch}`)
      .then(res => res.json())
      .then(data => {
        setMatchData(data);
        if (data.events && data.events.length > 0) {
          const max = Math.max(...data.events.map((e: any) => e.time));
          setMaxTime(max);
          setCurrentTime(0);
        }
      })
      .catch(console.error);
  }, [selectedMatch]);

  // Playback logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(t => {
          const next = t + 5000; // 5 seconds per tick
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }, 50); // 50ms interval = 100x speed
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxTime]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      <Sidebar 
        meta={meta}
        selectedMap={selectedMap} setSelectedMap={setSelectedMap}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        matches={matches}
        selectedMatch={selectedMatch} setSelectedMatch={setSelectedMatch}
        layersConfig={layersConfig} setLayersConfig={setLayersConfig}
      />
      
      <div className="flex-1 flex flex-col relative">
        <header className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
            LILA BLACK <span className="text-indigo-400 font-light">Telemetry</span>
          </h1>
          {matchData && (
            <div className="text-sm text-slate-300 font-medium drop-shadow-md mt-1">
              Match: {selectedMatch.split('.')[0]}
            </div>
          )}
        </header>

        <main className="flex-1 relative bg-slate-950">
          <MapView 
            matchData={matchData} 
            currentTime={currentTime} 
            layersConfig={layersConfig}
            mapId={selectedMap}
          />
        </main>
        
        {matchData && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-slate-950/90 to-transparent">
            <Timeline 
              currentTime={currentTime} 
              maxTime={maxTime} 
              setCurrentTime={setCurrentTime}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              events={matchData.events}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
