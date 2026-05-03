# LILA Black - Player Journey Visualization

## Architecture & System Design

### Why this Tech Stack?
We needed a system capable of loading ~90,000 telemetry events, processing them rapidly, and visualizing them in real-time over a 2D minimap with heavy interactivity (heatmaps, trails, time-scrubbing).

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Frontend** | React + Vite + TailwindCSS | Provides a blazing-fast development environment and a highly polished, modern UI. Tailwind enables rapid iteration of the premium aesthetic required for level designers. |
| **Visualization** | Deck.gl | The clear winner for rendering tens of thousands of points smoothly. Unlike Leaflet (which struggles with large SVG/Canvas datasets) or Plotly (which is clunky for real-time playback), Deck.gl is built on WebGL. It handles 60fps playback, heatmaps, and scatterplots flawlessly. |
| **Backend** | Python + FastAPI | Lightweight, extremely fast, and Python allows easy integration with Pandas for data manipulation. |
| **Data Processing**| Pandas + PyArrow | The raw dataset consists of 1,243 small Parquet files. Reading these sequentially on the fly would cause unacceptable latency. We use an offline ETL step to ingest and clean all files into a single, highly-optimized PyArrow Parquet file that the API can load into memory instantly. |

---

### Data Flow

1. **Ingestion (Offline)**: `data_processor.py` traverses all 1,243 files, infers the match date from the directory name, decodes byte strings, identifies bots vs human players based on UUID schemas, and concatenates everything into `combined_data.parquet`.
2. **API Layer**: `main.py` uses FastAPI to serve endpoints. It loads `combined_data.parquet` into memory on startup (taking <100ms).
3. **Frontend Request**: The React app queries `/api/meta` for available maps, dates, and matches, and `/api/events/{match_id}` to fetch a specific match.
4. **Rendering**: The event payload is stored in React state. Deck.gl renders the `OrthographicView` (a purely 2D, non-geospatial projection) using a `BitmapLayer` for the minimap and several `ScatterplotLayer`/`HeatmapLayer`s for the events.

---

### Coordinate Mapping System

To render the 3D game coordinates onto the 1024x1024 minimap, we transform the `(x, z)` world coordinates into pixel coordinates.

**Formula Used:**
```
u = (x - origin_x) / scale
v = (z - origin_z) / scale
pixel_x = u * 1024
pixel_y = (1 - v) * 1024
```

**Implementation in Deck.gl:**
Because Deck.gl's `BitmapLayer` naturally maps a `[0, 0, 1024, 1024]` bounding box in the `OrthographicView`, we use the exact formula above to calculate `[pixel_x, pixel_y]` for the `getPosition` accessor in our scatterplots. The `y` coordinate (elevation) is ignored as this is a 2D top-down visualization.

---

### Assumptions Made

1. **Date Inference**: The Parquet files do not contain a wall-clock timestamp column (only relative `ts`). We assumed the directory name (`February_10`) corresponds to the actual match date (`2026-02-10`).
2. **Bot Identification**: We assumed that `user_id` values that are purely numeric (or length < 10) represent bots, while standard UUIDs represent human players.
3. **Coordinate Plane**: We assumed `x` and `z` are the horizontal/depth planes matching the 2D map, and `y` is vertical elevation.
4. **Storm Kills**: `KilledByStorm` is attributed as a death, but usually without an aggressor. It's rendered alongside regular deaths for death heatmaps.
