# Docker Setup for Enterprise Attendance PWA

This directory contains the Docker configuration to containerize the application.

- **Dockerfile** – Builds the image using Node 18 Alpine and runs the Next.js server.
- **docker-compose.yml** – Simplifies building and running the container locally or on a remote server.
- **.dockerignore** – Excludes unnecessary files from the Docker build context.

## Quick Commands
```bash
# Build the Docker image
docker compose -f docker/docker-compose.yml build

# Run the container (exposes http://localhost:3000)
docker compose -f docker/docker-compose.yml up
```

Edit `.env.local.example` or rename it to `.env` to set environment variables for the container.
