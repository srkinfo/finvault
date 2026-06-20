#!/bin/bash
set -e

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
PROJECT_NAME="${PROJECT_NAME:-finvault}"
CLUSTER_NAME="${CLUSTER_NAME:-finvault-eks}"
NAMESPACE="finvault"

echo "=========================================="
echo "Deploying to Kubernetes (EKS)"
echo "=========================================="

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
BACKEND_IMAGE="${ECR_REGISTRY}/${PROJECT_NAME}-backend:latest"
FRONTEND_IMAGE="${ECR_REGISTRY}/${PROJECT_NAME}-frontend:latest"

# Update kubeconfig
echo "Updating kubeconfig for EKS cluster..."
aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}

# Verify cluster connection
echo "Verifying cluster connection..."
kubectl cluster-info

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Update image tags in deployment files
echo "Updating image tags in deployment files..."
sed -i "s|image: finvault-backend:latest|image: ${BACKEND_IMAGE}|g" k8s/backend-deployment.yaml
sed -i "s|image: finvault-frontend:latest|image: ${FRONTEND_IMAGE}|g" k8s/frontend-deployment.yaml

# Deploy secrets
echo "Deploying secrets..."
kubectl apply -f k8s/secrets.yaml -n ${NAMESPACE}

# Deploy PostgreSQL StatefulSet
echo "Deploying PostgreSQL..."
kubectl apply -f k8s/postgres-statefulset.yaml -n ${NAMESPACE}

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s

# Deploy backend
echo "Deploying backend..."
kubectl apply -f k8s/backend-service.yaml -n ${NAMESPACE}
kubectl apply -f k8s/backend-deployment.yaml -n ${NAMESPACE}

# Deploy frontend
echo "Deploying frontend..."
kubectl apply -f k8s/frontend-service.yaml -n ${NAMESPACE}
kubectl apply -f k8s/frontend-deployment.yaml -n ${NAMESPACE}

# Deploy HPA
echo "Deploying Horizontal Pod Autoscalers..."
kubectl apply -f k8s/hpa.yaml -n ${NAMESPACE}

# Deploy Ingress
echo "Deploying Ingress..."
kubectl apply -f k8s/ingress.yaml -n ${NAMESPACE}

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/finvault-backend -n ${NAMESPACE} --timeout=300s
kubectl rollout status deployment/finvault-frontend -n ${NAMESPACE} --timeout=300s

# Display deployment status
echo ""
echo "=========================================="
echo "Deployment Status"
echo "=========================================="
kubectl get pods -n ${NAMESPACE}
echo ""
kubectl get services -n ${NAMESPACE}
echo ""
kubectl get ingress -n ${NAMESPACE}
echo ""
kubectl get hpa -n ${NAMESPACE}

# Get ingress URL
echo ""
echo "=========================================="
echo "Access Information"
echo "=========================================="
INGRESS_HOSTNAME=$(kubectl get ingress finvault-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Pending...")
if [ "$INGRESS_HOSTNAME" != "Pending..." ]; then
  echo "Application URL: http://${INGRESS_HOSTNAME}"
  echo "Backend API: http://${INGRESS_HOSTNAME}/api"
else
  echo "Ingress hostname is still pending. Check with: kubectl get ingress -n ${NAMESPACE}"
fi

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="