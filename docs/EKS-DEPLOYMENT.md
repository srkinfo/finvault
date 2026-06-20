# FinVault - AWS EKS Deployment Guide

This guide will help you deploy the FinVault application to AWS EKS (Elastic Kubernetes Service).

## Prerequisites

Before you begin, ensure you have the following installed and configured:

- **AWS CLI** - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Terraform** >= 1.9 - [Installation Guide](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
- **kubectl** - [Installation Guide](https://kubernetes.io/docs/tasks/tools/)
- **Docker** - [Installation Guide](https://docs.docker.com/get-docker/)
- **Git** - [Installation Guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### AWS Configuration

1. **Configure AWS credentials:**

   ```bash
   aws configure
   ```

   You'll need:

   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)
   - Default output format (json)

2. **Verify AWS access:**
   ```bash
   aws sts get-caller-identity
   ```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │              EKS Cluster                          │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Ingress Controller (NGINX)                 │  │  │
│  │  │  Load Balancer (AWS NLB)                    │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │   Frontend   │  │   Backend    │             │  │
│  │  │   (React)    │  │  (Spring)    │             │  │
│  │  │   x2 pods    │  │   x3 pods    │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │         │                  │                      │  │
│  │         └────────┬─────────┘                      │  │
│  │                  │                                 │  │
│  │         ┌────────▼─────────┐                      │  │
│  │         │   PostgreSQL     │                      │  │
│  │         │   StatefulSet    │                      │  │
│  │         │   (Persistent)   │                      │  │
│  │         └──────────────────┘                      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ECR (Elastic Container Registry)                 │  │
│  │  - finvault-backend                               │  │
│  │  - finvault-frontend                              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## What Will Be Created

### AWS Resources

- **VPC** with public and private subnets across 3 AZs
- **EKS Cluster** (Kubernetes 1.28)
- **EKS Managed Node Group** (2x t3.medium instances, auto-scaling 1-5)
- **ECR Repositories** for backend and frontend images
- **Application Load Balancer** for ingress
- **Security Groups** and IAM roles

### Kubernetes Resources

- **Namespace**: `finvault`
- **Deployments**: Backend (3 replicas), Frontend (2 replicas)
- **StatefulSet**: PostgreSQL with persistent storage
- **Services**: ClusterIP services for backend and frontend
- **Ingress**: NGINX ingress controller with AWS NLB
- **HPA**: Horizontal Pod Autoscaling for both apps
- **Secrets**: Database credentials and JWT secret

### Cost Estimate

- **EKS Cluster**: ~$72/month
- **EC2 Nodes** (2x t3.medium): ~$60/month
- **NLB**: ~$22/month
- **ECR**: ~$5/month
- **EBS Storage**: ~$10/month
- **Total**: ~$170/month

_Note: Costs vary by region. Use single NAT gateway to reduce costs._

## Step-by-Step Deployment

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run setup script
./scripts/setup-terraform.sh
```

This will:

1. Check all prerequisites
2. Verify AWS credentials
3. Create terraform.tfvars automatically
4. Initialize and validate Terraform
5. Generate Terraform plan

### Option 2: Manual Setup

#### Step 1: Clone and Prepare

```bash
# Clone the repository (if not already done)
git clone https://github.com/srkinfo/finvault.git
cd finvault

# Make scripts executable
chmod +x scripts/*.sh
```

#### Step 2: Configure Terraform Variables

```bash
# Copy example variables
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit with your values
nano terraform/terraform.tfvars
```

**Important:** Update these values in `terraform/terraform.tfvars`:

- `admin_user_arn` - Your IAM user/role ARN (get with `aws sts get-caller-identity --query Arn --output text`)
- `aws_region` - Your preferred AWS region
- `tags.Owner` - Your email for resource tagging

#### Step 3: Initialize Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Review the plan
terraform plan -out=tfplan
```

#### Step 4: Deploy Infrastructure

```bash
# Apply the plan
terraform apply tfplan

# This will take 15-20 minutes to create all resources
```

After completion, Terraform will output important information:

- EKS Cluster endpoint
- ECR repository URLs
- Load balancer hostname

#### Step 5: Configure kubectl

```bash
# Update kubeconfig to connect to EKS
aws eks update-kubeconfig --region us-east-1 --name finvault-eks

# Verify connection
kubectl cluster-info
kubectl get nodes
```

#### Step 6: Build and Push Docker Images

```bash
# From project root
./scripts/build-and-push.sh
```

This will:

1. Login to ECR
2. Build backend Docker image
3. Build frontend Docker image
4. Push both images to ECR

#### Step 7: Deploy Application to Kubernetes

```bash
# Deploy all Kubernetes resources
./scripts/deploy-k8s.sh
```

This will:

1. Create namespace
2. Deploy secrets
3. Deploy PostgreSQL StatefulSet
4. Deploy backend and frontend
5. Deploy HPA for auto-scaling
6. Deploy ingress controller
7. Display access information

## Verification

### Check Pod Status

```bash
# All pods should be Running
kubectl get pods -n finvault

# Check PostgreSQL is ready
kubectl get pods -l app=postgres -n finvault

# Check backend pods
kubectl get pods -l app=backend -n finvault

# Check frontend pods
kubectl get pods -l app=frontend -n finvault
```

### Check Services

```bash
kubectl get services -n finvault
```

### Check Ingress

```bash
# Get ingress hostname
kubectl get ingress -n finvault

# It may take 2-3 minutes for the load balancer to be ready
```

### Check Logs

```bash
# Backend logs
kubectl logs -l app=backend -n finvault --tail=100

# Frontend logs
kubectl logs -l app=frontend -n finvault --tail=100

# PostgreSQL logs
kubectl logs -l app=postgres -n finvault
```

### Test the Application

Once the ingress hostname is available:

```bash
# Get the hostname
INGRESS_URL=$(kubectl get ingress finvault-ingress -n finvault -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test backend health
curl http://${INGRESS_URL}/actuator/health

# Test frontend
curl http://${INGRESS_URL}/

# Access in browser
echo "Application URL: http://${INGRESS_URL}"
```

## Configuration

### Environment Variables

The application uses these environment variables (configured in k8s/secrets.yaml):

- `SPRING_DATASOURCE_URL` - PostgreSQL connection URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `SPRING_PROFILES_ACTIVE` - Spring profile (production)

### Updating Secrets

To update secrets:

```bash
# Edit the secrets file
nano k8s/secrets.yaml

# Apply changes
kubectl apply -f k8s/secrets.yaml -n finvault

# Restart deployments to pick up new secrets
kubectl rollout restart deployment/finvault-backend -n finvault
kubectl rollout restart deployment/finvault-frontend -n finvault
```

### Scaling

The application uses Horizontal Pod Autoscaling (HPA):

```bash
# Check HPA status
kubectl get hpa -n finvault

# Manual scaling (if needed)
kubectl scale deployment finvault-backend -n finvault --replicas=5
kubectl scale deployment finvault-frontend -n finvault --replicas=3
```

### Updating the Application

To deploy a new version:

```bash
# 1. Build and push new images
./scripts/build-and-push.sh

# 2. Update deployments
kubectl rollout restart deployment/finvault-backend -n finvault
kubectl rollout restart deployment/finvault-frontend -n finvault

# 3. Monitor rollout
kubectl rollout status deployment/finvault-backend -n finvault
kubectl rollout status deployment/finvault-frontend -n finvault
```

## Cleanup

To destroy all resources and avoid ongoing charges:

```bash
# Delete Kubernetes resources first
kubectl delete namespace finvault

# Destroy Terraform resources
cd terraform
terraform destroy

# Confirm with 'yes' when prompted
```

**Warning:** This will permanently delete all resources including the database.

## Security Considerations

1. **Secrets Management**: Currently using Kubernetes secrets. For production, consider:

   - AWS Secrets Manager
   - HashiCorp Vault
   - External Secrets Operator (already installed)

2. **Network Security**:

   - PostgreSQL is not exposed externally
   - Backend and frontend use ClusterIP services
   - Only ingress is exposed via load balancer

3. **Image Security**:

   - ECR image scanning is enabled
   - Lifecycle policies remove old images
   - Non-root users in containers

4. **IAM**:
   - IRSA (IAM Roles for Service Accounts) enabled
   - Least privilege access policies

## Monitoring

### View Cluster Resources

```bash
# Node resources
kubectl top nodes

# Pod resources
kubectl top pods -n finvault

# Check HPA status
kubectl describe hpa -n finvault
```

### Logs

```bash
# All logs
kubectl logs -l app=backend -n finvault -f
kubectl logs -l app=frontend -n finvault -f
kubectl logs -l app=postgres -n finvault -f
```

## Troubleshooting

### Pods not starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n finvault

# Check for image pull errors
kubectl get events -n finvault --sort-by='.lastTimestamp'
```

### Database connection issues

```bash
# Check PostgreSQL is running
kubectl get pods -l app=postgres -n finvault

# Check PostgreSQL logs
kubectl logs -l app=postgres -n finvault

# Test connection from backend pod
kubectl exec -it <backend-pod> -n finvault -- nc -zv postgres-service 5432
```

### Ingress not working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl describe ingress finvault-ingress -n finvault

# Check load balancer
kubectl get svc -n ingress-nginx
```

### Terraform errors

```bash
# Check AWS credentials
aws sts get-caller-identity

# Validate Terraform
cd terraform
terraform validate

# Refresh state
terraform refresh
```

## Additional Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS EKS Module](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [FinVault GitHub Repository](https://github.com/srkinfo/finvault)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Terraform logs: `terraform apply`
3. Check Kubernetes events: `kubectl get events -n finvault`
4. Review application logs: `kubectl logs -l app=backend -n finvault`

## Next Steps

After successful deployment:

1. Set up a custom domain with Route 53
2. Configure SSL/TLS certificates with ACM
3. Set up CloudWatch for monitoring and logging
4. Configure AWS WAF for additional security
5. Set up CI/CD with GitHub Actions
6. Configure backup strategies for PostgreSQL
