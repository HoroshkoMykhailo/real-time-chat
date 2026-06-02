# Deploy Team Link on Google Cloud Run

This guide deploys the project with **`gcloud run deploy --source`** from the **repository root** (where the `Dockerfile` is). One **container** serves the **Vite SPA** from `apps/backend/public` and the **REST + Socket.IO** API on the **same HTTPS origin**.

**Region:** examples use **`europe-central2` (Warsaw)** — typically the lowest-latency Google Cloud region for traffic from Ukraine. **`europe-west3` (Frankfurt)** is a common alternative.

---

## Step 1 — Prerequisites

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`).
2. Enable **billing** on your GCP project.
3. In a terminal, authenticate and select the project:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

4. Work from the **repository root** for all commands below.

---

## Step 2 — Enable APIs and Artifact Registry (once per project)

Cloud Build needs **Artifact Registry** to store the image built from your source.

```bash
export REGION=europe-central2
export AR_REPO=team-link

gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories create "${AR_REPO}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Team Link images" \
  2>/dev/null || true
```

`secretmanager.googleapis.com` is included so you can store **JWT** and **encryption** secrets (recommended).

---

## Step 3 — MongoDB Atlas

1. Create a cluster and a database user with access to your app database.
2. **Network Access:** for a first deploy, add **`0.0.0.0/0`** so Cloud Run’s **dynamic egress IPs** can connect (use strong credentials + TLS). Tighten later with **[private endpoint on GCP](mongodb-atlas-gcp-private-endpoint.md)** if your org forbids open allowlists.
3. Copy the **`mongodb+srv://...`** connection string — you will put it in `MONGO_URI` in Step 5.

---

## Step 4 — Secret Manager (JWT and encryption)

Create secrets (run once per project, or when rotating):

```bash
echo -n 'your-jwt-secret' | gcloud secrets create JWT_SECRET --data-file=-
echo -n 'your-encryption-secret' | gcloud secrets create ENCRYPTION_SECRET --data-file=-
```

Grant the **default Cloud Run runtime** service account permission to read them (replace nothing if you use the default Compute identity):

```bash
export PROJECT_ID="$(gcloud config get-value project)"
export PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"

gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding ENCRYPTION_SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

If you use a **custom** service account on Cloud Run (`--service-account`), grant **`roles/secretmanager.secretAccessor`** on each secret to **that** service account instead.

Optional: store **`GOOGLE_OAUTH_CLIENT_SECRET`** the same way and add it to **`--set-secrets`** in Step 7.

---

## Step 5 — Environment file (`deploy/cloud-run.env.yaml`)

1. Copy the template:

   ```bash
   cp deploy/cloud-run.env.yaml.example deploy/cloud-run.env.yaml
   ```

2. Edit **`deploy/cloud-run.env.yaml`** (gitignored). Set at least:
   - **`MONGO_URI`** — Atlas connection string from Step 3.
   - **`GOOGLE_CLOUD_PROJECT_ID`** — your GCP project id.
   - **`GOOGLE_CLOUD_STORAGE_BUCKET`** — GCS bucket name or `''` if unused.

3. **Every value must be a string in YAML.** Quote numbers, e.g. **`ENCRYPTION_SALT_ROUNDS: '10'`**. Otherwise `gcloud` errors: `Environment variable values must be strings`.

4. Other keys have **defaults in code** or can stay as in the example (`apps/backend/src/libs/modules/config/config.module.ts`). Do **not** put **`JWT_SECRET`** / **`ENCRYPTION_SECRET`** in this file if you use Step 4 — pass them via **`--set-secrets`** in Step 7.

---

## Step 6 — Cloud Build service account (recommended)

In **Google Cloud Console → Cloud Build → Settings**, enable roles the build needs, for example:

- **Artifact Registry Writer** (push image)
- **Cloud Run Admin** (deploy revision)
- **Cloud Build Service Account** (“can perform builds”)

Grant **`roles/iam.serviceAccountUser`** on the **Cloud Run runtime** service account (often `PROJECT_NUMBER-compute@developer.gserviceaccount.com`) to **`PROJECT_NUMBER@cloudbuild.gserviceaccount.com`** so deploy can act as that identity.

If **`gcloud run deploy --source`** fails with **GCS `storage.objects.get`** on the default Compute SA, grant **`roles/storage.objectViewer`** on bucket **`gs://${PROJECT_ID}_cloudbuild`** to that SA, or route builds through the dedicated Cloud Build SA (see Cloud Build settings).

---

## Step 7 — Deploy (build from source + push to your Artifact Registry)

`--source=.` uploads the repo, **Cloud Build** builds the root **`Dockerfile`**, pushes the image, then Cloud Run deploys it.

By default, **`--source` alone** stores images in **`cloud-run-source-deploy`**. To use **your** Artifact Registry repo from Step 2, pass **`--image`** as well (same **region** and **project** in the image URL):

```bash
export REGION=europe-central2
export SERVICE=team-link
export AR_REPO=team-link
export PROJECT_ID="$(gcloud config get-value project)"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${SERVICE}:latest"

gcloud run deploy "${SERVICE}" \
  --region="${REGION}" \
  --source=. \
  --image="${IMAGE}" \
  --allow-unauthenticated \
  --port=8080 \
  --env-vars-file=deploy/cloud-run.env.yaml \
  --set-secrets="JWT_SECRET=JWT_SECRET:latest,ENCRYPTION_SECRET=ENCRYPTION_SECRET:latest"
```

The container listens on **8080** (`Dockerfile` sets `APP_HOST` / `APP_PORT` / `NODE_ENV`); override in the YAML only if you change the Cloud Run port.

Wait until the command prints the **service URL** (e.g. `https://team-link-….run.app`).

---

## Step 8 — After the first deploy (Google OAuth)

1. Fetch the URL if needed:

   ```bash
   gcloud run services describe "${SERVICE}" --region="${REGION}" --format='value(status.url)'
   ```

2. In **`deploy/cloud-run.env.yaml`**, set (no trailing slash on frontend):
   - **`GOOGLE_OAUTH_FRONTEND_URL`** — `https://YOUR_SERVICE_URL`
   - **`GOOGLE_OAUTH_REDIRECT_URI`** — `https://YOUR_SERVICE_URL/api/v1/auth/google/callback`

3. In **Google Cloud Console → APIs & Services → Credentials**, open your **OAuth 2.0 Web client** and add the same **Authorized redirect URI**.

4. Redeploy so the new env applies (same command as Step 7). To **only** change variables without rebuilding from source, you can instead use **Cloud Run → Edit service → Variables & secrets** in the console, or `gcloud run services update` with `--env-vars-file` / `--update-env-vars`.

---

## Step 9 — Optional: scaling and WebSockets

| Flag / setting          | When to use                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `--min-instances=1`     | Fewer cold starts; better for **Socket.IO**.                        |
| `--session-affinity`    | If you run **more than one instance** and use WebSockets.           |
| `--no-cpu-throttling`   | CPU always on; often used with long-lived connections (costs more). |
| `--service-account=...` | Custom runtime SA for GCS / Speech / Vertex IAM.                    |

Example update (no rebuild from source needed if only changing runtime flags):

```bash
gcloud run services update "${SERVICE}" \
  --region="${REGION}" \
  --min-instances=1 \
  --no-cpu-throttling
```

---

## Reference — SPA build and Mongo

- **Frontend:** the Docker image sets `VITE_APP_NODE_ENV=production` and `VITE_API_PATH=/api/v1`. You do **not** need `VITE_APP_PROXY_SERVER_URL` when the UI and API share the Cloud Run URL; the client uses `globalThis.location.origin`.
- **MongoDB private endpoint:** [MongoDB Atlas private endpoint on GCP](mongodb-atlas-gcp-private-endpoint.md).

---

## Reference — Useful commands

```bash
# Service URL
gcloud run services describe "${SERVICE}" --region="${REGION}" --format='value(status.url)'

# Logs
gcloud run services logs read "${SERVICE}" --region="${REGION}" --limit=50

# Revisions
gcloud run revisions list --service="${SERVICE}" --region="${REGION}"
```
