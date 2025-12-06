#!/bin/bash

echo "🚀 Starting Port Forwarding for Madina Cluster..."

# ------------------------------------------------------------------
# 1. CORE INFRASTRUCTURE (Gateway & Planner)
# ------------------------------------------------------------------

# 🚪 Madina Gateway (HTTP/FastAPI)
# CHANGED: Mapping Local 8080 -> Container 8000 (Avoids port 8000 conflicts)
echo "🔌 Connecting Gateway..."
kubectl port-forward deploy/madina-gateway 8080:8000 &
PID1=$!

# 🧠 Planner Service (LLM)
# Local: 8001 -> Container: 8001 (Confirmed working, just need correct API path)
echo "🔌 Connecting Planner..."
kubectl port-forward deploy/planner-deployment 8001:8001 &
PID3=$!

# ------------------------------------------------------------------
# 2. MICROSERVICES (Direct Access / Debugging)
# ------------------------------------------------------------------

# 🚌 Mobility Service
# Local: 8002 -> Container: 8000
kubectl port-forward deploy/mobility-deployment 8002:8000 &
PID4=$!

# 💨 Air Quality Service
# Local: 30081 -> Container: 8080
kubectl port-forward deploy/air-quality-deployment 30081:8080 &
PID5=$!

# 📅 Events Service
# Local: 8082 -> Container: 8082
kubectl port-forward deploy/events-deployment 8082:8082 &
PID6=$!

# 🚑 Urgence Service (gRPC)
# Local: 9090 -> Container: 9090
kubectl port-forward deploy/urgence-deployment 9090:9090 &
PID7=$!

# 🚑 Urgence Service (REST)
# Local: 30090 -> Container: 9091
kubectl port-forward deploy/urgence-deployment 30090:9091 &
PID8=$!

# ------------------------------------------------------------------
# 3. FRONTENDS
# ------------------------------------------------------------------

# 💻 Main Frontend
# Local: 30005 -> Container: 3000
kubectl port-forward deploy/frontend-deployment 30005:3000 &
PID9=$!

# 🚑 Urgence Frontend
# Local: 30006 -> Container: 3000
kubectl port-forward deploy/urgence-frontend-deployment 30006:3000 &
PID10=$!

# Give forwards a moment to establish
sleep 3

echo "✅ All port forwards established!"
echo "---------------------------------------------------"
echo "🌐 GATEWAY API:     http://localhost:8080/docs  <-- NEW PORT"
echo "🧠 Planner API:     http://localhost:8001/docs  <-- CHECK ROUTES HERE"
echo "💻 Main Frontend:   http://localhost:30005"
echo "🚑 Urgence Front:   http://localhost:30006"
echo "---------------------------------------------------"
echo "Press Ctrl+C to stop all forwards."

trap "kill $PID1 $PID3 $PID4 $PID5 $PID6 $PID7 $PID8 $PID9 $PID10" SIGINT
wait