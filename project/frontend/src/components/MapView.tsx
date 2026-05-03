import React, { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer, BitmapLayer, IconLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import type { PlayerEvent, MatchData } from '../App';

interface MapViewProps {
  matchData: MatchData | null;
  currentTime: number;
  layersConfig: any;
  mapId: string;
}

const MAP_CONFIGS: Record<string, { scale: number, ox: number, oz: number, img: string }> = {
  AmbroseValley: { scale: 900, ox: -370, oz: -473, img: 'AmbroseValley_Minimap.png' },
  GrandRift: { scale: 581, ox: -290, oz: -290, img: 'GrandRift_Minimap.png' },
  Lockdown: { scale: 1000, ox: -500, oz: -500, img: 'Lockdown_Minimap.jpg' },
};

export default function MapView({ matchData, currentTime, layersConfig, mapId }: MapViewProps) {
  const config = MAP_CONFIGS[mapId] || MAP_CONFIGS['AmbroseValley'];

  const INITIAL_VIEW_STATE = {
    target: [512, 512, 0],
    zoom: 0,
    minZoom: -1,
    maxZoom: 3,
  };

  const toPixelCoords = (x: number, z: number) => {
    const u = (x - config.ox) / config.scale;
    const v = (z - config.oz) / config.scale;
    return [u * 1024, (1 - v) * 1024];
  };

  const layers = useMemo(() => {
    const l = [
      new BitmapLayer({
        id: 'minimap',
        bounds: [0, 0, 1024, 1024],
        image: `/minimaps/${config.img}`,
        pickable: false,
      })
    ];

    if (!matchData) return l;

    // Filter events up to current time
    const visibleEvents = matchData.events.filter(e => e.time <= currentTime);
    
    // Trail calculation: only show last 30 seconds of movement for trails
    const trailWindow = 30000;
    const trailEvents = visibleEvents.filter(e => 
      e.time >= currentTime - trailWindow && 
      (e.event === 'Position' || e.event === 'BotPosition')
    );

    // Filter by type
    const humanTrails = trailEvents.filter(e => !e.is_bot);
    const botTrails = trailEvents.filter(e => e.is_bot);

    if (layersConfig.showPlayers) {
      l.push(new ScatterplotLayer({
        id: 'human-trail',
        data: humanTrails,
        getPosition: (d: PlayerEvent) => toPixelCoords(d.x, d.z) as [number, number],
        getFillColor: (d: PlayerEvent) => {
          const age = currentTime - d.time;
          const alpha = Math.max(0, 255 - (age / trailWindow) * 255);
          return [59, 130, 246, alpha]; // Blue
        },
        getRadius: 4,
        pickable: true,
      }));
    }

    if (layersConfig.showBots) {
      l.push(new ScatterplotLayer({
        id: 'bot-trail',
        data: botTrails,
        getPosition: (d: PlayerEvent) => toPixelCoords(d.x, d.z) as [number, number],
        getFillColor: (d: PlayerEvent) => {
          const age = currentTime - d.time;
          const alpha = Math.max(0, 255 - (age / trailWindow) * 255);
          return [239, 68, 68, alpha]; // Red
        },
        getRadius: 3,
        pickable: true,
      }));
    }

    // Significant Events
    const allEvents = visibleEvents;
    const kills = allEvents.filter(e => e.event === 'Kill' || e.event === 'BotKill');
    const deaths = allEvents.filter(e => e.event === 'Killed' || e.event === 'BotKilled' || e.event === 'KilledByStorm');
    const loot = allEvents.filter(e => e.event === 'Loot');

    if (layersConfig.showKills) {
      l.push(new ScatterplotLayer({
        id: 'kills-layer',
        data: kills,
        getPosition: (d: PlayerEvent) => toPixelCoords(d.x, d.z) as [number, number],
        getFillColor: [250, 204, 21], // Yellow
        getLineColor: [0, 0, 0],
        lineWidthMinPixels: 1,
        getRadius: 6,
        pickable: true,
      }));
    }

    if (layersConfig.showDeaths) {
      l.push(new ScatterplotLayer({
        id: 'deaths-layer',
        data: deaths,
        getPosition: (d: PlayerEvent) => toPixelCoords(d.x, d.z) as [number, number],
        getFillColor: [0, 0, 0], // Black with white border
        getLineColor: [255, 255, 255],
        lineWidthMinPixels: 2,
        getRadius: 6,
        pickable: true,
      }));
    }

    if (layersConfig.showLoot) {
      l.push(new ScatterplotLayer({
        id: 'loot-layer',
        data: loot,
        getPosition: (d: PlayerEvent) => toPixelCoords(d.x, d.z) as [number, number],
        getFillColor: [16, 185, 129], // Green
        getRadius: 4,
        pickable: true,
      }));
    }

    // Heatmaps (use entire match data to show overall heatmaps)
    if (layersConfig.heatmap !== 'none') {
      let heatmapData = [];
      if (layersConfig.heatmap === 'kills') heatmapData = matchData.events.filter(e => e.event === 'Kill' || e.event === 'BotKill');
      if (layersConfig.heatmap === 'deaths') heatmapData = matchData.events.filter(e => e.event === 'Killed' || e.event === 'BotKilled' || e.event === 'KilledByStorm');
      if (layersConfig.heatmap === 'traffic') heatmapData = matchData.events.filter(e => e.event === 'Position' || e.event === 'BotPosition');

      l.push(new HeatmapLayer({
        id: 'heatmap-layer',
        data: heatmapData,
        getPosition: (d: PlayerEvent) => toPixelCoords(d.x, d.z) as [number, number],
        getWeight: 1,
        radiusPixels: layersConfig.heatmap === 'traffic' ? 40 : 60,
        intensity: layersConfig.heatmap === 'traffic' ? 0.5 : 2,
        threshold: 0.05,
      }));
    }

    return l;
  }, [matchData, currentTime, layersConfig, config]);

  return (
    <div className="absolute inset-0 bg-[#0f172a] rounded-xl overflow-hidden border border-slate-800 shadow-2xl m-6 mt-24 flex items-center justify-center">
      <DeckGL
        views={new OrthographicView({ id: 'ortho' })}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getTooltip={({object}: any) => object && `${object.event}\nPlayer: ${object.user_id}\nTime: ${Math.floor(object.time / 1000)}s`}
      />
    </div>
  );
}
