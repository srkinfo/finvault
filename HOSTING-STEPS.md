# FinVault - Hosting Steps

Follow these steps to host your application on AWS EKS.

## Prerequisites Check

First, verify you have these installed:

```bash
# Check AWS CLI
aws --version

# Check Terraform
terraform version

# Check kubectl
kubectl version --client

# Check Docker
docker --version
```

If any are missing, install them first.

---

## 📋 Step-by-Step Hosting Guide

### Step 1: Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure

# You'll be prompted for:
# - AWS Access Key ID (from AWS Console > IAM > Users > Security Credentials)
# - AWS Secret Access Key
# - Default region: ap-south-1 (Mumbai, India)
# - Default output format: json

# Verify it works
aws sts get-caller-identity
```

**Expected output:**

```json
{
  "UserId": "AID...",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

---

### Step 2: Get Your IAM ARN

```bash
# Copy your ARN from the output above
aws sts get-caller-identity --query Arn --output text

# Example: arn:aws:iam::123456789012:user/srk90
```

**Save this ARN** - you'll need it in the next step.

---

### Step 3: Configure Terraform Variables

```bash
# Navigate to your project
cd c:\Users\srk90\finvault

# Copy the example configuration
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit the file with your values
notepad terraform/terraform.tfvars
```

**Update these 3 values in the file:**

1. **admin_user_arn** - Paste the ARN from Step 2

   ```
   admin_user_arn = "arn:aws:iam::123456789012:user/your-username"
   ```

2. **aws_region** - Your preferred region (default: ap-south-1 - Mumbai, India)

   ```
   aws_region = "us-east-1"
   ```

3. **tags.Owner** - Your email address
   ```
   tags = {
     Environment = "production"
     Project     = "finvault"
     ManagedBy   = "terraform"
     Owner       = "your-email@example.com"
   }
   ```

Save and close the file.

---

### Step 4: Deploy AWS Infrastructure

This creates VPC, EKS cluster, load balancers, ECR repos, etc.

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform (downloads providers and modules)
terraform init

# Review what will be created
terraform plan -out=tfplan

# Deploy infrastructure
terraform apply tfplan
```

**When prompted:**

- Type `yes` and press Enter
- Wait 15-20 minutes for completion

**Expected output at the end:**

```
Apply complete! Resources: 45 added, 0 changed, 0 destroyed.

Outputs:

cluster_endpoint = "https://xxx.gr7.us-east-1.eks.amazonaws.com"
cluster_name = "finvault-eks"
ecr_backend_repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/finvault-backend"
ecr_frontend_repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/finvault-frontend"
```

---

### Step 5: Configure kubectl

```bash
# Go back to project root
cd ..

# Connect kubectl to your EKS cluster
aws eks update-kubeconfig --region ap-south-1 --name finvault-eks

# Verify connection - you should see your nodes
kubectl get nodes
```

**Expected output:**

```
NAME                                           STATUS   ROLES    AGE   VERSION
ip-10-0-1-123.us-east-1.compute.internal      Ready    <none>   5m    v1.28.x
ip-10-0-2-456.us-east-1.compute.internal      Ready    <none>   5m    v1.28.x
```

---

### Step 6: Build and Push Docker Images

```bash
# Build backend and frontend images, push to ECR
bash scripts/build-and-push.sh
```

**This will:**

1. Login to ECR
2. Build backend Docker image (~3-5 minutes)
3. Build frontend Docker image (~2-3 minutes)
4. Push both images to ECR

**Expected output:**

```
Images successfully pushed to ECR!
Backend: 123456789012.dkr.ecr.us-east-1.amazonaws.com/finvault-backend:latest
Frontend: 123456789012.dkr.ecr.us-east-1.amazonaws.com/finvault-frontend:latest
```

---

### Step 7: Deploy Application to Kubernetes

```bash
# Deploy all Kubernetes resources
bash scripts/deploy-k8s.sh
```

**This will:**

1. Create namespace
2. Deploy secrets
3. Deploy PostgreSQL database
4. Deploy backend (3 pods)
5. Deploy frontend (2 pods)
6. Deploy auto-scaling (HPA)
7. Deploy ingress controller
8. Display access information

**Expected output:**

```
Deployment Status
NAME                                    READY   STATUS    RESTARTS   AGE
postgres-0                              1/1     Running   0          2m
finvault-backend-xxx                    1/1     Running   0          1m
finvault-frontend-xxx                   1/1     Running   0          1m

NAME                                         TYPE           EXTERNAL-IP
finvault-ingress                             <pending>      <pending>

Access Information
Application URL: http://a1b2c3d4e5f6g7h8.us-east-1.elb.amazonaws.com
```

---

## Step 8: Access Your Application

The ingress hostname may take 2-3 minutes to become available. Check with:

```bash
# Get the application URL
kubectl get ingress -n finvault

# Or use the Makefile
make url
```

Once you see the hostname, access your app:

```
http://<your-ingress-hostname>.us-east-1.elb.amazonaws.com
```

**Test the backend:**

```bash
curl http://<your-ingress-hostname>/actuator/health
```

---

## Monitor Your Deployment

```bash
# Check all pods are running
kubectl get pods -n finvault

# View logs
kubectl logs -l app=backend -n finvault -f

# Check autoscaling
kubectl get hpa -n finvault

# Check all resources
make status
```

---

## Update Application (When Needed)

```bash
# After making code changes:
bash scripts/build-and-push.sh

# Restart deployments
kubectl rollout restart deployment/finvault-backend -n finvault
kubectl rollout restart deployment/finvault-frontend -n finvault

# Monitor rollout
kubectl rollout status deployment/finvault-backend -n finvault
```

---

## Cleanup (When Done)

To avoid ongoing charges (~$170/month):

```bash
# Delete Kubernetes resources
kubectl delete namespace finvault

# Destroy all AWS resources
cd terraform
terraform destroy
# Type 'yes' when prompted
```

---

## Time Estimate

- **Step 1-3**: 5 minutes (configuration)
- **Step 4**: 15-20 minutes (infrastructure)
- **Step 5**: 1 minute (kubectl)
- **Step 6**: 5-10 minutes (build images)
- **Step 7**: 3-5 minutes (deploy app)
- **Total**: ~30-40 minutes

---

## Cost: ~$170/month

- EKS Cluster: $72
- EC2 Nodes (2x t3.medium): $60
- Network Load Balancer: $22
- ECR + EBS Storage: $16

**Tip**: To reduce costs by ~$32/month, edit `terraform/terraform.tfvars` and set:

```
single_nat_gateway = true
```

---

## Troubleshooting

### AWS CLI not working

```bash
# Reconfigure
aws configure
```

### Terraform errors

```bash
cd terraform
terraform validate
terraform plan
```

### Pods not starting

```bash
kubectl get pods -n finvault
kubectl describe pod <pod-name> -n finvault
kubectl logs -l app=backend -n finvault
```

### Ingress not ready

```bash
kubectl get ingress -n finvault
kubectl describe ingress finvault-ingress -n finvault
# Wait 2-3 minutes for load balancer
```

---

## Quick Commands Reference

```bash
# Complete deployment
make deploy

# Check status
make status

# Get URL
make url

# View logs
make logs

# Restart app
make restart

# Cleanup
make clean    # Delete K8s resources
make destroy  # Delete all AWS resources
```

---

## You're Ready!

Start with **Step 1** above. The entire process takes about 30-40 minutes.

**Need help?** Check `docs/EKS-DEPLOYMENT.md` for detailed troubleshooting.

Good luck!
