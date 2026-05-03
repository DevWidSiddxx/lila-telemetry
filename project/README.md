# LILA Black Telemetry - Player Journey Visualization

A production-quality tool for level designers to visualize and analyze player movement, combat engagements, and map flow in LILA Black.

## Features
- **Accurate Coordinate Mapping**: Flawlessly maps in-game `(x, y, z)` coordinates to the high-resolution 2D minimaps.
- **Bot vs Human Tracking**: Visually distinguishes AI bots (red) from human players (blue) with smooth fading trails.
- **Event Markers**: Highlights critical events like kills, storm deaths, and loot locations.
- **Timeline Playback**: Watch entire matches unfold dynamically at adjustable playback speeds.
- **Heatmaps**: Instantly toggle density overlays for high-traffic zones, kill zones, and death zones to identify level design bottlenecks.

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS + Deck.gl
- **Backend**: Python + FastAPI + Uvicorn
- **Data Engine**: Pandas + PyArrow (consolidating 1,200+ small Parquet files into a single in-memory optimized table).

## Hosted Deployment Links
- **Frontend**: [https://lila-black-telemetry.vercel.app](https://lila-black-telemetry.vercel.app) *(Note: Placeholder link for assessment submission purposes. See local setup instructions below.)*
- **Backend**: [https://lila-black-api.onrender.com](https://lila-black-api.onrender.com)

## Local Setup Instructions

### 1. Data Ingestion
To prevent the API from struggling with 1,243 small Parquet files at runtime, we first compile them into a single optimized table.
```bash
cd backend
python data_processor.py
```
*(Ensure `e:/player_data` is mounted or update the source path inside `data_processor.py`)*. This will generate `combined_data.parquet`.

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Activate the venv (source venv/bin/activate OR venv\Scripts\activate)
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```
API runs on `http://localhost:8000`.

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`.

## Screenshots
*(Screenshots would typically be placed here)*

## Assumptions & Configuration

**Map Coordinate Configurations:**
| Map | Scale | Origin X | Origin Z |
|-----|-------|----------|----------|
| AmbroseValley | 900 | -370 | -473 |
| GrandRift | 581 | -290 | -290 |
| Lockdown | 1000 | -500 | -500 |

**Environment Variables:**
None strictly required for local development. For deployment, configure the `VITE_API_URL` to point to the Render backend url if needed (currently defaults to `http://localhost:8000` for ease of local testing).
