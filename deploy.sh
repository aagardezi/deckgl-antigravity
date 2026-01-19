#!/bin/bash
PROJECT_ID=$1
REGION="us-central1"
SERVICE_NAME="hiscox-risk-explorer"

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: ./deploy.sh <PROJECT_ID>"
  exit 1
fi

echo "Deploying to Project: $PROJECT_ID"

# Enable necessary services (optional, but good practice)
# gcloud services enable cloudbuild.googleapis.com run.googleapis.com --project $PROJECT_ID

# Grant BigQuery Permissions to Cloud Run Service Account
echo "Granting BigQuery permissions..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/bigquery.jobUser"

# Build and Submit to Artifact Registry (using GCR for simplicity here, but AR is recommended)
# Note: Ensure you have permissions and API enabled.
echo "Building container..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME . --project $PROJECT_ID

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID

echo "Deployment Complete!"
