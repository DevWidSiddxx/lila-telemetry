import pandas as pd
df = pd.read_parquet('e:/player_data/project/combined_data.parquet')
print(df['event'].value_counts())
