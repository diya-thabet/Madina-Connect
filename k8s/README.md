# 🏙️ Madina Smart City - Kubernetes Deployment

This directory contains the Kubernetes orchestration manifests for the **Madina Smart City Platform**. The platform follows a **Service-Oriented Architecture (SOA)** integrating **REST, SOAP, GraphQL, and AI Microservices**.

---

## 🏗️ Architecture Overview

The system consists of **4 distinct microservices** deployed as a single stack:

| Service             | Type      | Protocol     | Internal Port | External (NodePort) | Description |
|--------------------|-----------|------------|---------------|------------------|-------------|
| Planner (Orchestrator) | AI Agent  | HTTP/JSON  | 8001          | 30001           | The "Brain". Orchestrates calls to other services and uses Gemini AI to generate itineraries. |
| Mobility Service    | REST      | HTTP/JSON  | 8000          | 30000           | Real-time traffic and transport lines (FastAPI). |
| Air Quality         | SOAP      | XML/WSDL   | 8081          | 30081           | Pollution monitoring service (Java Spring Boot). Maps internal 8080 → 8081. |
| Events              | GraphQL   | HTTP/JSON  | 8082          | 30082           | Citizen events database (Node.js/Python). |

---

## ⚙️ Configuration Files

### `madina-stack.yaml`

This is a **single-file manifest** defining the full state of the application, including:

- **Secrets (`madina-secrets`)**: Stores sensitive data like `GEMINI_API_KEY`.  
  **Action Required:** Replace the placeholder with your real Google Gemini API key before deployment:

```yaml
stringData:
  GEMINI_API_KEY: "YOUR_REAL_KEY"

# Example for Kind
kind load docker-image dhia2001/madina-planner-llm:latest --name madina-cluster
# Repeat for other images


kubectl apply -f k8s/madina-stack.yaml


kubectl get pods -w
