import React, { useMemo } from 'react';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';
import type { PlayerEvent } from '../App';

interface TimelineProps {
  currentTime: number;
  maxTime: number;
  setCurrentTime: (t: number) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  events: PlayerEvent[];
}

export default function Timeline({ currentTime, maxTime, setCurrentTime, isPlaying, setIsPlaying, events }: TimelineProps) {
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  // Generate density markers for kills and deaths
  const markers = useMemo(() => {
    return events.filter(e => e.event.includes('Kill') || e.event === 'KilledByStorm').map(e => ({
      type: e.event.includes('Bot') ? 'bot' : 'human',
      percent: (e.time / maxTime) * 100,
    }));
  }, [events, maxTime]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl backdrop-blur-sm bg-opacity-80">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-colors"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        
        <div className="text-slate-300 font-mono text-sm min-w-[60px]">
          {formatTime(currentTime)}
        </div>

        <div className="flex-1 relative flex items-center">
          {/* Custom Slider Track */}
          <div className="absolute inset-0 top-1/2 -mt-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-75"
              style={{ width: `${(currentTime / maxTime) * 100}%` }}
            />
          </div>
          
          {/* Event Markers */}
          <div className="absolute inset-0 pointer-events-none top-1/2 -mt-1 h-2">
            {markers.map((m, i) => (
              <div 
                key={i}
                className={`absolute top-0 w-1 h-full opacity-50 ${m.type === 'human' ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ left: `${m.percent}%` }}
              />
            ))}
          </div>

          <input 
            type="range" 
            min="0" 
            max={maxTime} 
            value={currentTime} 
            onChange={handleSlider}
            className="w-full absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="text-slate-400 font-mono text-sm min-w-[60px]">
          {formatTime(maxTime)}
        </div>
      </div>
    </div>
  );
}
