import json
import pandas as pd
from pathlib import Path

input_path = Path("./Backend/uploads/only_crime_tables.json")
output_path = Path("./Backend/uploads/filtered_crime_reports.json")

# Mapping: which table = which crime type
table_map = {
    29: "IPC",       # Table 30 (0-indexed)
    30: "SLL",       # Table 31
    31: "IPC+SLL"    # Table 32
}

results = []

# Load all tables
with open(input_path, "r", encoding="utf-8") as f:
    tables = json.load(f)

for idx, table in enumerate(tables):
    if idx not in table_map:
        continue

    crime_type = table_map[idx]
    df = pd.DataFrame(table)

    if "SL" not in df.columns:
        continue

    for row in df["SL"]:
        if not isinstance(row, str):
            continue

        parts = row.strip().split()

        # Must have enough tokens to split correctly
        if len(parts) < 8:
            continue

        try:
            # Extract state name = from index 1 to -6
            state = " ".join(parts[1:-6])

            # Extract crime rate = second last value
            rate_val = float(parts[-2])

            results.append({
                "state": state,
                "crime": crime_type,
                "rate": rate_val,
                "year": 2022
            })
        except:
            continue

# Save to JSON
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print(f"[✔] Extracted {len(results)} records to: {output_path}")
