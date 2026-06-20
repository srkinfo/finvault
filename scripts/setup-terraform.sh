#!/bin/bash
set -e

echo "=========================================="
echo "Setting up Terraform for FinVault EKS"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install Terraform >= 1.0"
    echo "Visit: https://www.terraform.io/downloads.html"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install AWS CLI"
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl"
    echo "Visit: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ All prerequisites are installed"

# Verify AWS credentials
echo ""
echo "Verifying AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run: aws configure"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account ID: ${AWS_ACCOUNT_ID}"

# Get IAM user ARN
echo ""
echo "Getting IAM user ARN..."
ADMIN_USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
echo "✅ IAM User ARN: ${ADMIN_USER_ARN}"

# Create terraform.tfvars from example
echo ""
if [ ! -f terraform/terraform.tfvars ]; then
    echo "Creating terraform.tfvars from example..."
    cp terraform/terraform.tfvars.example terraform/terraform.tfvars
    
    # Update with actual values
    sed -i "s|arn:aws:iam::123456789012:user/your-username|${ADMIN_USER_ARN}|g" terraform/terraform.tfvars
    sed -i "s|your-email@example.com|$(aws iam get-user --query User.UserName --output text 2>/dev/null || echo 'admin')@example.com|g" terraform/terraform.tfvars
    
    echo "✅ Created terraform/terraform.tfvars"
    echo "⚠️  Please review and update terraform/terraform.tfvars with your specific values"
else
    echo "⚠️  terraform/terraform.tfvars already exists. Skipping creation."
fi

# Initialize Terraform
echo ""
echo "Initializing Terraform..."
cd terraform
terraform init
echo "✅ Terraform initialized"

# Validate Terraform configuration
echo ""
echo "Validating Terraform configuration..."
terraform validate
echo "✅ Terraform configuration is valid"

# Show Terraform plan
echo ""
echo "Generating Terraform plan..."
terraform plan -out=tfplan
echo "✅ Terraform plan generated"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review terraform/terraform.tfvars and update if needed"
echo "2. Review the Terraform plan: terraform show tfplan"
echo "3. Apply the plan: terraform apply tfplan"
echo "4. After EKS is created, configure kubectl: aws eks update-kubeconfig --region ap-south-1 --name finvault-eks"
echo "5. Build and push Docker images: ./scripts/build-and-push.sh"
echo "6. Deploy to Kubernetes: ./scripts/deploy-k8s.sh"
echo ""
echo "Estimated cost: ~$50-70/month for the EKS cluster and resources"
echo "(excluding data transfer and additional storage)"