# Quick Start Guide - Deploy FinVault to AWS EKS

Get your FinVault application running on AWS EKS in 30 minutes!

## Prerequisites Checklist

- [ ] AWS Account with admin access
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Terraform >= 1.0 installed
- [ ] kubectl installed
- [ ] Docker installed and running
- [ ] Git installed

## 5-Step Deployment

### Step 1: Prepare (2 minutes)

```bash
# Clone the repository
git clone https://github.com/srkinfo/finvault.git
cd finvault

# Make scripts executable
chmod +x scripts/*.sh

# Verify AWS access
aws sts get-caller-identity
```

### Step 2: Configure (1 minute)

```bash
# Get your IAM ARN
aws sts get-caller-identity --query Arn --output text

# Copy and edit terraform variables
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
nano terraform/terraform.tfvars  # Update admin_user_arn and tags.Owner
```

### Step 3: Create Infrastructure (15-20 minutes)

```bash
# Initialize Terraform
cd terraform
terraform init

# Review the plan
terraform plan -out=tfplan

# Deploy infrastructure
terraform apply tfplan
# Type 'yes' when prompted

# This creates: VPC, EKS Cluster, ECR repos, Load Balancers, etc.
```

### Step 4: Configure kubectl (1 minute)

```bash
# Connect kubectl to your EKS cluster
aws eks update-kubeconfig --region us-east-1 --name finvault-eks

# Verify connection
kubectl get nodes
```

### Step 5: Deploy Application (5 minutes)

```bash
# Go back to project root
cd ..

# Build and push Docker images to ECR
./scripts/build-and-push.sh

# Deploy to Kubernetes
./scripts/deploy-k8s.sh
```

## Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n finvault

# Get the application URL
kubectl get ingress -n finvault

# Test the application (replace with your ingress hostname)
curl http://<INGRESS_HOSTNAME>/actuator/health
```

## Success!

Your application is now running on AWS EKS!

- **Frontend**: http://<INGRESS_HOSTNAME>
- **Backend API**: http://<INGRESS_HOSTNAME>/api
- **Health Check**: http://<INGRESS_HOSTNAME>/actuator/health

## Monitor Your Deployment

```bash
# View all resources
kubectl get all -n finvault

# Check logs
kubectl logs -l app=backend -n finvault -f
kubectl logs -l app=frontend -n finvault -f

# Check autoscaling
kubectl get hpa -n finvault
```

## Update Application

```bash
# Make code changes, then:
./scripts/build-and-push.sh
kubectl rollout restart deployment/finvault-backend -n finvault
kubectl rollout restart deployment/finvault-frontend -n finvault
```

## Cleanup

```bash
# Delete application
kubectl delete namespace finvault

# Destroy infrastructure
cd terraform
terraform destroy
```

## Cost Estimate

~$170/month for:

- EKS Cluster: $72
- EC2 Nodes (2x t3.medium): $60
- Network Load Balancer: $22
- ECR Storage: $5
- EBS Storage: $10

**Tip**: Use `single_nat_gateway = true` in terraform.tfvars to reduce costs by ~$32/month.

## Need Help?

- Full documentation: [EKS-DEPLOYMENT.md](./EKS-DEPLOYMENT.md)
- Check logs: `kubectl logs -l app=backend -n finvault`
- Check events: `kubectl get events -n finvault`

## What's Next?

1. Set up a custom domain with Route 53
2. Configure SSL/TLS with ACM
3. Set up CloudWatch monitoring
4. Configure AWS WAF for security
5. Set up CI/CD with GitHub Actions
6. Configure automated backups
