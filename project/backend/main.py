import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uvicorn
from typing import List, Optional

app = FastAPI(title="LILA Black Telemetry API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global dataset
df = None

@app.on_event("startup")
def load_data():
    global df
    data_path = os.path.join(os.path.dirname(__file__), "..", "combined_data.parquet")
    if os.path.exists(data_path):
        print(f"Loading data from {data_path}...")
        df = pd.read_parquet(data_path)
        print(f"Loaded {len(df)} rows.")
    else:
        print("Warning: combined_data.parquet not found. Run data_processor.py first.")

@app.get("/api/meta")
def get_metadata():
    if df is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")
    
    maps = df['map_id'].unique().tolist()
    dates = sorted(df['match_date'].unique().tolist())
    matches = df['match_id'].unique().tolist()
    
    return {
        "maps": maps,
        "dates": dates,
        "total_matches": len(matches),
        "matches": matches[:100] # Provide first 100 for easy testing
    }

@app.get("/api/matches")
def search_matches(map_id: Optional[str] = None, date: Optional[str] = None, limit: int = 50):
    if df is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")
        
    filtered = df
    if map_id:
        filtered = filtered[filtered['map_id'] == map_id]
        
    if date:
        filtered = filtered[filtered['match_date'] == date]

    match_ids = filtered['match_id'].unique().tolist()
    return {"matches": match_ids[:limit]}

@app.get("/api/events/{match_id}")
def get_match_events(match_id: str):
    if df is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")
        
    match_df = df[df['match_id'] == match_id].copy()
    if match_df.empty:
        raise HTTPException(status_code=404, detail="Match not found")
        
    # Sort by timestamp
    match_df = match_df.sort_values('ts')
    
    # Convert ts back to milliseconds or seconds from start for easier frontend handling
    min_ts = match_df['ts'].min()
    match_df['relative_ms'] = (match_df['ts'] - min_ts).dt.total_seconds() * 1000
    
    # We want to return a JSON array of events
    # We'll map the data
    # Convert nan to None
    match_df = match_df.where(pd.notnull(match_df), None)
    
    events = match_df.to_dict(orient='records')
    # Filter out columns we don't need to save bandwidth
    return {
        "match_id": match_id,
        "map_id": match_df['map_id'].iloc[0],
        "events": [
            {
                "user_id": e["user_id"],
                "is_bot": e["is_bot"],
                "x": e["x"],
                "z": e["z"],
                "y": e["y"],
                "event": e["event"],
                "time": e["relative_ms"]
            }
            for e in events
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
