#!/bin/bash
set -e

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
PROJECT_NAME="${PROJECT_NAME:-finvault}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
BACKEND_IMAGE="${ECR_REGISTRY}/${PROJECT_NAME}-backend:latest"
FRONTEND_IMAGE="${ECR_REGISTRY}/${PROJECT_NAME}-frontend:latest"

echo "=========================================="
echo "Building and Pushing Docker Images to ECR"
echo "=========================================="

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: ${AWS_ACCOUNT_ID}"

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Create ECR repositories if they don't exist
echo "Creating ECR repositories..."
aws ecr describe-repositories --repository-name ${PROJECT_NAME}-backend --region ${AWS_REGION} || \
  aws ecr create-repository --repository-name ${PROJECT_NAME}-backend --region ${AWS_REGION}
aws ecr describe-repositories --repository-name ${PROJECT_NAME}-frontend --region ${AWS_REGION} || \
  aws ecr create-repository --repository-name ${PROJECT_NAME}-frontend --region ${AWS_REGION}

# Build backend image
echo "Building backend image..."
cd backend
docker build -t ${PROJECT_NAME}-backend:latest .
docker tag ${PROJECT_NAME}-backend:latest ${BACKEND_IMAGE}
cd ..

# Build frontend image
echo "Building frontend image..."
cd frontend
docker build -t ${PROJECT_NAME}-frontend:latest .
docker tag ${PROJECT_NAME}-frontend:latest ${FRONTEND_IMAGE}
cd ..

# Push images to ECR
echo "Pushing backend image to ECR..."
docker push ${BACKEND_IMAGE}
echo "Pushing frontend image to ECR..."
docker push ${FRONTEND_IMAGE}

echo "=========================================="
echo "Images successfully pushed to ECR!"
echo "Backend: ${BACKEND_IMAGE}"
echo "Frontend: ${FRONTEND_IMAGE}"
echo "=========================================="