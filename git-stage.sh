#!/bin/bash

echo "=========================================="
echo "GitHub - Stage Required Files"
echo "=========================================="
echo ""

# Navigate to project
cd c:\Users\srk90\finvault

echo "1. Removing diagnostic scripts from git tracking..."
git rm --cached check-local.sh check-local.bat 2>/dev/null || true

echo ""
echo "2. Staging all required files..."
git add README.md
git add docker-compose.yml
git add Makefile
git add .gitignore

echo ""
echo "3. Staging backend files..."
git add backend/
git add backend/Dockerfile
git add backend/pom.xml
git add backend/.dockerignore

echo ""
echo "4. Staging frontend files..."
git add frontend/
git add frontend/Dockerfile
git add frontend/nginx.conf
git add frontend/.dockerignore
git add frontend/package.json
git add frontend/package-lock.json

echo ""
echo "5. Staging Kubernetes manifests..."
git add k8s/

echo ""
echo "6. Staging Terraform files..."
git add terraform/
git add terraform/main.tf
git add terraform/variables.tf
git add terraform/terraform.tfvars.example
git add terraform/.gitignore
git add terraform/iam-policies/

echo ""
echo "7. Staging scripts..."
git add scripts/

echo ""
echo "8. Staging documentation..."
git add docs/
git add HOSTING-STEPS.md

echo ""
echo "9. Staging GitHub Actions..."
git add .github/

echo ""
echo "=========================================="
echo "Files staged for commit:"
echo "=========================================="
git status --short

echo ""
echo "=========================================="
echo "Next steps:"
echo "=========================================="
echo ""
echo "1. Review staged files:"
echo "   git status"
echo ""
echo "2. Commit changes:"
echo "   git commit -m 'Add AWS EKS deployment configuration and documentation'"
echo ""
echo "3. Push to GitHub:"
echo "   git push origin main"
echo ""