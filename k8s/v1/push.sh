#!/bin/bash

# Define your Docker Hub username
USERNAME="dhia2001"

echo "🐳 Building and Pushing Docker Images for Madina Smart City..."

# 1. Mobility Service
echo "🚌 Building Mobility Service..."
# Assuming code is in 'mobility_service' folder
docker build -t $USERNAME/madina-mobility:latest ./mobility_service
docker push $USERNAME/madina-mobility:latest

# 2. Air Quality Service
echo "💨 Building Air Quality Service..."
# Assuming code is in 'soap_service' folder
docker build -t $USERNAME/madina-airquality:latest ./soap_service
docker push $USERNAME/madina-airquality:latest

# 3. Events Service
echo "📅 Building Events Service..."
# Assuming code is in 'graphql_service' folder
docker build -t $USERNAME/madina-events:latest ./graphql_service
docker push $USERNAME/madina-events:latest

# 4. Urgence Backend
echo "🚑 Building Urgence Backend..."
# Assuming code is in 'grpc_service' folder
docker build -t $USERNAME/urgence-backend:latest ./grpc_service
docker push $USERNAME/urgence-backend:latest

echo "✅ All images pushed! Your 'ImagePullBackOff' errors should resolve soon."