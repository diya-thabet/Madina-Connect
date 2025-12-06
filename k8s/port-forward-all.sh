#!/bin/bash

echo "🚀 Starting Port Forwarding for Madina Cluster..."

# ------------------------------------------------------------------
# 1. CORE INFRASTRUCTURE (Gateway & Planner)
# ------------------------------------------------------------------

# 🚪 Madina Gateway (HTTP/FastAPI) -> Localhost:8000
# CRITICAL: This connects your React App to the backend.
# We forward the 'deploy' because the Service might only define port 50051.
kubectl port-forward deploy/madina-gateway 8000:8000 &
PID1=$!

# 🚪 Madina Gateway (gRPC) -> Localhost:50051
# Useful for Postman or grpcurl debugging
kubectl port-forward svc/madina-gateway-service 50051:50051 &
PID2=$!

# 🧠 Planner Service (LLM) -> Localhost:8001
kubectl port-forward svc/planner-service 8001:8001 &
PID3=$!

# ------------------------------------------------------------------
# 2. MICROSERVICES (Direct Access / Debugging)
# ------------------------------------------------------------------

# 🚌 Mobility Service -> Localhost:8002
# Moved to 8002 to avoid conflict with Gateway on 8000
kubectl port-forward svc/mobility-service 8002:8000 &
PID4=$!

# 💨 Air Quality Service -> Localhost:30081
# Using 30081 to avoid conflict with standard 8081
kubectl port-forward svc/air-quality-service 30081:8081 &
PID5=$!

# 🎉 Events Service -> Localhost:8082
kubectl port-forward svc/events-service 8082:8082 &
PID6=$!

# 🚑 Urgence Service (gRPC) -> Localhost:9090
kubectl port-forward svc/urgence-service 9090:9090 &
PID7=$!

# 🚑 Urgence Service (REST/Tomcat) -> Localhost:30090
# Access Swagger/API directly if needed
kubectl port-forward svc/urgence-service 30090:8081 &
PID8=$!

# ------------------------------------------------------------------
# 3. FRONTENDS
# ------------------------------------------------------------------

# 💻 Main Frontend -> Localhost:30005
kubectl port-forward svc/frontend-service 30005:3000 &
PID9=$!

# 🚑 Urgence Frontend -> Localhost:30006
kubectl port-forward svc/urgence-frontend 30006:3000 &
PID10=$!

echo "✅ All port forwards established!"
echo "---------------------------------------------------"
echo "🌐 MAIN API (Gateway HTTP): http://localhost:8000  <-- React App connects here"
echo "🧠 Planner API:             http://localhost:8001"
echo "🚪 Gateway gRPC:            localhost:50051"
echo "---------------------------------------------------"
echo "🔍 DEBUG PORTS (Direct Service Access):"
echo "   - Mobility:    http://localhost:8002"
echo "   - Air Quality: http://localhost:30081"
echo "   - Events:      http://localhost:8082"
echo "   - Urgence REST:http://localhost:30090"
echo "---------------------------------------------------"
echo "Press CTRL+C to stop all forwards."

# Wait for user to press CTRL+C
trap "kill $PID1 $PID2 $PID3 $PID4 $PID5 $PID6 $PID7 $PID8 $PID9 $PID10" INT
wait