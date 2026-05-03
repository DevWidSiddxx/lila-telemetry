import React from 'react';
import { Layers, Map as MapIcon, Calendar, Target, Skull, User, Eye, MapPin } from 'lucide-react';

interface SidebarProps {
  meta: any;
  selectedMap: string;
  setSelectedMap: (m: string) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  matches: string[];
  selectedMatch: string;
  setSelectedMatch: (m: string) => void;
  layersConfig: any;
  setLayersConfig: (c: any) => void;
}

export default function Sidebar({
  meta, selectedMap, setSelectedMap, selectedDate, setSelectedDate,
  matches, selectedMatch, setSelectedMatch, layersConfig, setLayersConfig
}: SidebarProps) {
  
  if (!meta) return <div className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex items-center justify-center">Loading...</div>;

  const toggleLayer = (key: string) => {
    setLayersConfig({ ...layersConfig, [key]: !layersConfig[key] });
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-xl z-20">
      
      <div className="p-6 border-b border-slate-800 space-y-4 overflow-y-auto">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center"><MapIcon size={14} className="mr-2"/> Filters</h2>
        
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Map</label>
          <select 
            value={selectedMap} 
            onChange={e => setSelectedMap(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
          >
            {meta.maps.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Date</label>
          <select 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
          >
            {meta.dates.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Match ({matches.length} found)</label>
          <select 
            value={selectedMatch} 
            onChange={e => setSelectedMatch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
          >
            {matches.map((m: string) => <option key={m} value={m}>{m.split('.')[0].slice(0, 8)}... ({m.length})</option>)}
          </select>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center"><Layers size={14} className="mr-2"/> Visualization Layers</h2>
        
        <div className="space-y-3">
          <LayerToggle active={layersConfig.showPlayers} onClick={() => toggleLayer('showPlayers')} label="Human Players" icon={<User size={16} className="text-blue-400" />} />
          <LayerToggle active={layersConfig.showBots} onClick={() => toggleLayer('showBots')} label="AI Bots" icon={<User size={16} className="text-red-400" />} />
          <LayerToggle active={layersConfig.showKills} onClick={() => toggleLayer('showKills')} label="Kills" icon={<Target size={16} className="text-yellow-400" />} />
          <LayerToggle active={layersConfig.showDeaths} onClick={() => toggleLayer('showDeaths')} label="Deaths" icon={<Skull size={16} className="text-white" />} />
          <LayerToggle active={layersConfig.showLoot} onClick={() => toggleLayer('showLoot')} label="Loot Events" icon={<MapPin size={16} className="text-emerald-400" />} />
        </div>

        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-8 mb-4 flex items-center"><Eye size={14} className="mr-2"/> Heatmaps</h2>
        
        <div className="space-y-2 grid grid-cols-2 gap-2">
          {['none', 'kills', 'deaths', 'traffic'].map((h) => (
            <button
              key={h}
              onClick={() => setLayersConfig({ ...layersConfig, heatmap: h })}
              className={`col-span-1 p-2 rounded-lg text-xs font-medium transition-all ${layersConfig.heatmap === h ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {h.charAt(0).toUpperCase() + h.slice(1)}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function LayerToggle({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center p-3 rounded-xl transition-all ${active ? 'bg-slate-800 border border-slate-700 text-white shadow-sm' : 'bg-slate-900/50 text-slate-500 border border-transparent hover:bg-slate-800'}`}
    >
      <div className={`mr-3 p-1.5 rounded-lg ${active ? 'bg-slate-700/50' : 'opacity-50'}`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      <div className={`ml-auto w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-indigo-500' : 'bg-slate-700'}`}>
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
    </button>
  );
}
