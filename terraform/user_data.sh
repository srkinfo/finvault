#!/bin/bash
set -e

# Update system
apt update -y
apt upgrade -y

# Install Docker
apt install -y docker.io docker-compose

# Start Docker
systemctl start docker
systemctl enable docker

# Add docker group (optional, for non-root docker access)
groupadd -f docker
usermod -aG docker ubuntu || true

# Pull Docker images
docker pull ${docker_registry}/finvault-backend:latest
docker pull ${docker_registry}/finvault-frontend:latest

# Run containers
docker run -d \
  --name backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  ${docker_registry}/finvault-backend:latest

docker run -d \
  --name frontend \
  -p 3000:3000 \
  ${docker_registry}/finvault-frontend:latest

# Log completion
echo "FinVault application deployed successfully at $(date)" >> /var/log/finvault-deployment.log
