import os
import pandas as pd
import pyarrow.parquet as pq
import glob

def process_data(source_dir, output_file):
    print("Finding parquet files...")
    # Get all files in February_* directories
    files = []
    for day in ["February_10", "February_11", "February_12", "February_13", "February_14"]:
        day_dir = os.path.join(source_dir, day)
        if os.path.exists(day_dir):
            for f in os.listdir(day_dir):
                files.append((os.path.join(day_dir, f), day))
    
    print(f"Found {len(files)} files. Reading data...")
    
    dfs = []
    for f_path, day in files:
        try:
            table = pq.read_table(f_path)
            df = table.to_pandas()
            # Add date derived from folder name
            # February_10 -> 2026-02-10
            day_num = day.split('_')[1]
            df['match_date'] = f"2026-02-{day_num}"
            dfs.append(df)
        except Exception as e:
            print(f"Error reading {f_path}: {e}")
            
    if not dfs:
        print("No data found!")
        return
        
    print("Concatenating dataframes...")
    combined = pd.concat(dfs, ignore_index=True)
    
    print("Cleaning data...")
    # Decode event bytes to string
    combined['event'] = combined['event'].apply(lambda x: x.decode('utf-8') if isinstance(x, bytes) else x)
    
    # Identify humans vs bots
    combined['is_bot'] = combined['user_id'].apply(lambda x: x.isdigit() or len(str(x)) < 10)
    
    print("Saving to consolidated parquet...")
    combined.to_parquet(output_file, engine='pyarrow', index=False)
    print(f"Saved {len(combined)} rows to {output_file}")

if __name__ == "__main__":
    process_data("e:/player_data", "e:/player_data/project/combined_data.parquet")
