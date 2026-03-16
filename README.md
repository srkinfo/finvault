# 🏦 FinVault — AI-Powered Personal Finance App

Full-stack personal finance management built with Spring Boot + React.

## Tech Stack
- **Backend**: Spring Boot 3.2, Spring Security, JWT, JPA/Hibernate
- **Frontend**: React 18, Tailwind CSS, Recharts
- **Database**: PostgreSQL (H2 for dev)
- **DevOps**: Docker, GitHub Actions, Kubernetes, AWS, Terraform

## Run Locally
`ash
docker-compose up --build
`
- Backend → http://localhost:8080
- Frontend → http://localhost:3000
- H2 Console → http://localhost:8080/h2-console

## Features
- 💰 Transaction tracking with 16 categories
- 📊 Budget planner with smart alerts
- 🎯 Savings goals tracker
- 📈 AI spending insights
- 🏦 Net worth calculator
- 🔐 JWT Authentication

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/transactions
- POST /api/transactions
- GET  /api/budgets
- GET  /api/goals
