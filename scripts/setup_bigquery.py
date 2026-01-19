import argparse
import random
import datetime
from google.cloud import bigquery
from google.api_core.exceptions import NotFound

# Configuration
DATASET_ID = "hiscox_risk_data"
PROPERTIES_TABLE = "properties"
CLAIMS_TABLE = "claims"

# Mock Data Constants
SF_LAT = 37.7749
SF_LON = -122.4194
LDN_LAT = 51.5074
LDN_LON = -0.1278
LAT_VARIANCE = 0.1
LON_VARIANCE = 0.1

RISK_TYPES = ['Flood', 'Fire', 'Wind', 'Theft']
CLAIM_TYPES = ['Water Damage', 'Fire', 'Windstorm', 'Burglary', 'Liability']

HOTSPOTS = [
    {'lat': 37.75, 'lon': -122.45, 'radius': 0.03, 'risk_boost': 40, 'type': 'Flood'},
    {'lat': 37.80, 'lon': -122.40, 'radius': 0.02, 'risk_boost': 30, 'type': 'Fire'},
    {'lat': 51.50, 'lon': -0.11, 'radius': 0.02, 'risk_boost': 45, 'type': 'Flood'},
    {'lat': 51.51, 'lon': -0.09, 'radius': 0.015, 'risk_boost': 35, 'type': 'Theft'},
]

def is_on_land(lat, lon, city):
    if city == 'San Francisco':
        # Simple bounding box/exclusion for SF water
        # Reject if too far east (Bay)
        if lon > -122.39: return False
        # Reject if too far north (Bay)
        if lat > 37.81: return False
        # Reject if too far west (Ocean)
        if lon < -122.51: return False
        # Reject if in the water gap north of Golden Gate Park but south of Presidio (approx)
        # This is a simplification
        return True
    return True # Assume London is fine for now or add logic if needed

def generate_mock_data(count=5000):
    properties = []
    claims = []
    
    generated_count = 0
    while generated_count < count:
        is_london = random.random() > 0.5
        center_lat = LDN_LAT if is_london else SF_LAT
        center_lon = LDN_LON if is_london else SF_LON

        lat = random.uniform(center_lat - LAT_VARIANCE, center_lat + LAT_VARIANCE)
        lon = random.uniform(center_lon - LON_VARIANCE, center_lon + LON_VARIANCE)
        city = 'London' if is_london else 'San Francisco'

        if not is_on_land(lat, lon, city):
            continue

        generated_count += 1

        # Risk Logic
        risk_score = random.uniform(10, 60)
        primary_risk = 'General'

        for spot in HOTSPOTS:
            dist = ((lat - spot['lat'])**2 + (lon - spot['lon'])**2)**0.5
            if dist < spot['radius']:
                risk_score += spot['risk_boost'] * (1 - dist / spot['radius'])
                if random.random() > 0.5:
                    primary_risk = spot['type']
        
        risk_score = min(100, max(0, risk_score))
        tiv = random.uniform(200000, 5000000)

        prop_id = f"prop-{generated_count}"
        street_names = ['High St', 'Station Rd', 'London Rd', 'Church St', 'Main St', 'Park Rd'] if is_london else \
                       ['Market', 'Mission', 'Valencia', 'Geary', 'California', 'Powell']
        street_suffix = '' if is_london else 'St'
        address = f"{random.randint(1, 9999)} {random.choice(street_names)} {street_suffix}".strip()

        properties.append({
            "id": prop_id,
            "latitude": lat,
            "longitude": lon,
            "address": address,
            "tiv": tiv,
            "risk_score": risk_score,
            "primary_risk": primary_risk,
            "year_built": random.randint(1900, 2023),
            "city": city
        })

        # Claims Logic
        if risk_score > 50 and random.random() > 0.6:
            num_claims = random.randint(1, 4)
            for j in range(num_claims):
                days_ago = random.randint(0, 365 * 2)
                claim_date = (datetime.date.today() - datetime.timedelta(days=days_ago)).isoformat()
                claims.append({
                    "claim_id": f"clm-{generated_count}-{j}",
                    "property_id": prop_id,
                    "date": claim_date,
                    "amount": random.uniform(1000, tiv * 0.1),
                    "type": random.choice(CLAIM_TYPES)
                })

    return properties, claims

def setup_bigquery(project_id, truncate=False):
    client = bigquery.Client(project=project_id)
    dataset_ref = f"{project_id}.{DATASET_ID}"

    # Create Dataset
    try:
        client.get_dataset(dataset_ref)
        print(f"Dataset {dataset_ref} already exists.")
    except NotFound:
        dataset = bigquery.Dataset(dataset_ref)
        dataset.location = "US"
        client.create_dataset(dataset)
        print(f"Created dataset {dataset_ref}.")

    # Define Schemas
    property_schema = [
        bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("latitude", "FLOAT", mode="REQUIRED"),
        bigquery.SchemaField("longitude", "FLOAT", mode="REQUIRED"),
        bigquery.SchemaField("address", "STRING"),
        bigquery.SchemaField("tiv", "FLOAT"),
        bigquery.SchemaField("risk_score", "FLOAT"),
        bigquery.SchemaField("primary_risk", "STRING"),
        bigquery.SchemaField("year_built", "INTEGER"),
        bigquery.SchemaField("city", "STRING"),
    ]

    claim_schema = [
        bigquery.SchemaField("claim_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("property_id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("date", "DATE"),
        bigquery.SchemaField("amount", "FLOAT"),
        bigquery.SchemaField("type", "STRING"),
    ]

    # Create Tables
    tables = [
        (PROPERTIES_TABLE, property_schema),
        (CLAIMS_TABLE, claim_schema)
    ]

    for table_name, schema in tables:
        table_ref = f"{dataset_ref}.{table_name}"
        try:
            client.get_table(table_ref)
            print(f"Table {table_ref} already exists.")
            if truncate:
                print(f"Truncating table {table_ref}...")
                client.query(f"TRUNCATE TABLE `{table_ref}`").result()
                print("Table truncated.")
        except NotFound:
            table = bigquery.Table(table_ref, schema=schema)
            client.create_table(table)
            print(f"Created table {table_ref}.")

    # Generate and Load Data
    print("Generating mock data...")
    properties, claims = generate_mock_data(5000)

    print(f"Loading {len(properties)} properties...")
    errors = client.insert_rows_json(f"{dataset_ref}.{PROPERTIES_TABLE}", properties)
    if errors:
        print(f"Encountered errors while inserting properties: {errors}")
    else:
        print("Properties loaded successfully.")

    print(f"Loading {len(claims)} claims...")
    errors = client.insert_rows_json(f"{dataset_ref}.{CLAIMS_TABLE}", claims)
    if errors:
        print(f"Encountered errors while inserting claims: {errors}")
    else:
        print("Claims loaded successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Setup BigQuery schema and load mock data.")
    parser.add_argument("--project_id", required=True, help="GCP Project ID")
    parser.add_argument("--truncate", action="store_true", help="Truncate existing tables before loading")
    args = parser.parse_args()

    setup_bigquery(args.project_id, args.truncate)
