# Docker Setup Guide

The **docker** directory has been added to the project root. It contains everything needed to containerize and run the Enterprise Attendance PWA on any Linux server (e.g., Ubuntu) or in the cloud.

## Files
- `docker/Dockerfile` – Builds a production‑ready image using **Node 18 Alpine**.
- `docker/docker-compose.yml` – Simple compose file that builds the image and forwards port **3000**. It also loads environment variables from `.env.local.example`.
- `docker/.dockerignore` – Excludes local `node_modules`, the Next.js build output (`.next`), and the Docker configuration files themselves from the build context.

## Build and Run Locally
```bash
# From the project root
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up
```
The application will be available at `http://localhost:3000`.

## Deploy to a Remote Ubuntu Server
1. **Copy the project** (or at least the `docker/` folder) to the server.
2. Install Docker and Docker Compose on the server:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin
   ```
3. From the project root on the server, run the same compose commands as above.
4. Adjust the environment variables if needed – rename `.env.local.example` to `.env` and edit the values before starting the container.

## Why This Works
- **Single‑stage build** – Simpler for development and works well for small apps. All dependencies are installed, the app is built, and the same image is used to run the server.
- **Port exposure** – Port `3000` is the default for Next.js, forwarded to the host.
- **External env** – Keeping env vars out of the image makes it easy to change configuration per deployment.

Feel free to customize the `docker-compose.yml` (e.g., add a PostgreSQL service) as your infrastructure evolves.
