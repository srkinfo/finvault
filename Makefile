.PHONY: help deploy deploy-infra deploy-app build-images clean logs status

help: ## Show this help message
	@echo "FinVault - AWS EKS Deployment Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

deploy: deploy-infra deploy-app ## Complete deployment (infrastructure + application)

deploy-infra: ## Deploy Terraform infrastructure (EKS cluster, VPC, etc.)
	@echo "🚀 Deploying infrastructure..."
	cd terraform && terraform init
	cd terraform && terraform plan -out=tfplan
	cd terraform && terraform apply tfplan
	@echo "✅ Infrastructure deployed!"
	@echo "📝 Next: Configure kubectl with: aws eks update-kubeconfig --region ap-south-1 --name finvault-eks"

deploy-app: build-images ## Deploy application to Kubernetes
	@echo "🚀 Deploying application..."
	./scripts/deploy-k8s.sh
	@echo "✅ Application deployed!"

build-images: ## Build and push Docker images to ECR
	@echo "🔨 Building and pushing images..."
	./scripts/build-and-push.sh
	@echo "✅ Images pushed!"

setup: ## Run automated setup script
	@echo "⚙️  Running setup..."
	./scripts/setup-terraform.sh

logs-backend: ## Show backend logs
	kubectl logs -l app=backend -n finvault -f

logs-frontend: ## Show frontend logs
	kubectl logs -l app=frontend -n finvault -f

logs-postgres: ## Show PostgreSQL logs
	kubectl logs -l app=postgres -n finvault -f

logs: ## Show all logs
	@echo "=== Backend Logs ==="
	kubectl logs -l app=backend -n finvault --tail=50
	@echo ""
	@echo "=== Frontend Logs ==="
	kubectl logs -l app=frontend -n finvault --tail=50
	@echo ""
	@echo "=== PostgreSQL Logs ==="
	kubectl logs -l app=postgres -n finvault --tail=50

status: ## Show deployment status
	@echo "📊 Deployment Status"
	@echo ""
	@echo "=== Pods ==="
	kubectl get pods -n finvault
	@echo ""
	@echo "=== Services ==="
	kubectl get services -n finvault
	@echo ""
	@echo "=== Ingress ==="
	kubectl get ingress -n finvault
	@echo ""
	@echo "=== HPA ==="
	kubectl get hpa -n finvault
	@echo ""
	@echo "=== Nodes ==="
	kubectl get nodes

url: ## Get application URL
	@kubectl get ingress finvault-ingress -n finvault -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Ingress not ready yet. Run 'make status' to check."

restart-backend: ## Restart backend deployment
	kubectl rollout restart deployment/finvault-backend -n finvault
	kubectl rollout status deployment/finvault-backend -n finvault

restart-frontend: ## Restart frontend deployment
	kubectl rollout restart deployment/finvault-frontend -n finvault
	kubectl rollout status deployment/finvault-frontend -n finvault

restart: restart-backend restart-frontend ## Restart all deployments

scale-backend: ## Scale backend (usage: make scale-backend REPLICAS=5)
	kubectl scale deployment finvault-backend -n finvault --replicas=$(REPLICAS)
	kubectl get hpa -n finvault

scale-frontend: ## Scale frontend (usage: make scale-frontend REPLICAS=3)
	kubectl scale deployment finvault-frontend -n finvault --replicas=$(REPLICAS)
	kubectl get hpa -n finvault

clean: ## Delete all Kubernetes resources
	@echo "🗑️  Deleting Kubernetes resources..."
	kubectl delete namespace finvault
	@echo "✅ Kubernetes resources deleted!"

destroy: ## Destroy all Terraform resources
	@echo "⚠️  WARNING: This will delete all AWS resources!"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	sleep 5
	cd terraform && terraform destroy
	@echo "✅ All resources destroyed!"

plan: ## Show Terraform plan
	cd terraform && terraform plan

validate: ## Validate Terraform configuration
	cd terraform && terraform validate

fmt: ## Format Terraform files
	cd terraform && terraform fmt -recursive

kubeconfig: ## Update kubeconfig for EKS
	aws eks update-kubeconfig --region ap-south-1 --name finvault-eks
	kubectl cluster-info
	kubectl get nodes
