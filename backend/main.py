import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import bigquery

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize BigQuery Client
# It will use the environment variable GOOGLE_CLOUD_PROJECT or default credentials
client = bigquery.Client()

DATASET_ID = "hiscox_risk_data"

@app.get("/api/properties")
def get_properties():
    # Construct the query
    # We use the project ID from the client if available, or assume the dataset is in the default project
    project_id = client.project
    dataset_ref = f"{project_id}.{DATASET_ID}"
    
    query = f"""
        SELECT
            p.id, p.latitude, p.longitude, p.address, p.tiv, p.risk_score, p.primary_risk, p.year_built, p.city,
            ARRAY_AGG(STRUCT(c.claim_id, c.date, c.amount, c.type)) AS claims
        FROM `{dataset_ref}.properties` p
        LEFT JOIN `{dataset_ref}.claims` c ON p.id = c.property_id
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9
    """
    
    try:
        query_job = client.query(query)
        results = []
        for row in query_job:
            # Format claims
            claims = []
            if row.claims and len(row.claims) > 0 and row.claims[0]['claim_id'] is not None:
                 for c in row.claims:
                     claims.append({
                         "id": c['claim_id'],
                         "date": c['date'].isoformat() if c['date'] else None,
                         "amount": c['amount'],
                         "type": c['type']
                     })

            results.append({
                "id": row.id,
                "position": [row.longitude, row.latitude], # DeckGL expects [lon, lat]
                "address": row.address,
                "tiv": row.tiv,
                "riskScore": row.risk_score,
                "primaryRisk": row.primary_risk,
                "yearBuilt": row.year_built,
                "city": row.city,
                "claims": claims,
                "claimsCount": len(claims),
                "totalClaimAmount": sum(c['amount'] for c in claims)
            })
        return results
    except Exception as e:
        print(f"Error querying BigQuery: {e}")
        return {"error": str(e)}

# Serve static files (React app)
# Check for dist directory in common locations
current_dir = os.path.dirname(__file__)
possible_dirs = [
    os.path.join(current_dir, "dist"),        # Docker / Production
    os.path.join(current_dir, "../dist"),     # Local Development
]

static_dir = None
for d in possible_dirs:
    if os.path.exists(d):
        static_dir = d
        break

if static_dir:
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    print(f"Warning: Static directory not found in {possible_dirs}. API will work, but frontend won't be served.")
