import pandas as pd

df = pd.read_parquet('e:/player_data/project/combined_data.parquet')

print("1. Most popular map for kills:")
print(df[df['event'] == 'Kill']['map_id'].value_counts())

print("\n2. Deaths to storm vs players:")
print(df[df['event'].isin(['Killed', 'KilledByStorm'])]['event'].value_counts())

print("\n3. Looting behavior:")
print("Total loots:", len(df[df['event'] == 'Loot']))
