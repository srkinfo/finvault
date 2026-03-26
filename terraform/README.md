# FinVault Terraform Infrastructure

This directory contains Terraform configuration to deploy FinVault on AWS.

## Prerequisites

1. **Terraform**: Install from https://www.terraform.io/downloads
2. **AWS Account**: With appropriate IAM permissions
3. **AWS CLI**: Configured with credentials
4. **EC2 Key Pair**: Create one in AWS EC2 console

## Setup Instructions

### Step 1: Configure Variables

Copy the example variables file and update it with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set:
- `key_pair_name`: Your EC2 key pair name (required)
- `aws_region`: Desired AWS region (default: ap-southeast-1)
- `instance_type`: EC2 instance type (default: t2.micro)
- `ssh_allowed_cidrs`: Restrict SSH access (recommended instead of 0.0.0.0/0)

### Step 2: Initialize Terraform

```bash
terraform init
```

### Step 3: Review the Plan

```bash
terraform plan
```

### Step 4: Apply Configuration

```bash
terraform apply
```

Type `yes` to confirm.

## Outputs

After successful deployment, Terraform will output:
- `instance_id`: EC2 instance ID
- `instance_public_ip`: Public IP address
- `instance_public_dns`: Public DNS name
- `backend_url`: URL to access the backend API
- `frontend_url`: URL to access the frontend application

Access your application:
- Frontend: http://<public_ip>:3000
- Backend API: http://<public_ip>:8080

## Files

- `main.tf`: Main infrastructure configuration
- `variables.tf`: Variable definitions
- `outputs.tf`: Output values
- `user_data.sh`: EC2 initialization script
- `terraform.tfvars.example`: Example variables file

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

## Security Notes

⚠️ **Important Security Considerations**:

1. Don't use `0.0.0.0/0` for SSH access in production
2. Store sensitive data (key pairs, credentials) securely
3. Use `terraform.tfvars` (not committed) for sensitive values
4. Consider using IAM roles instead of access keys
5. Enable VPC Flow Logs for monitoring
6. Restrict security group ingress rules as needed

## Troubleshooting

### Key Pair Not Found
Ensure you've created the key pair in AWS and specified the correct name.

### Insufficient IAM Permissions
Verify your AWS credentials have permissions for EC2, security groups, and VPC.

### User Data Errors
Check EC2 instance system logs if Docker containers don't start automatically.

## References

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
