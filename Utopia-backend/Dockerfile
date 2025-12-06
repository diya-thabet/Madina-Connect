# Base Python Image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for SOAP (zeep/lxml)
RUN apt-get update && apt-get install -y \
    build-essential \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
# Expects: app/requirements.txt
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- GRPC CODE GENERATION STEP ---
# 1. Copy the proto file
# ⚠️ CRITICAL: This expects the file at 'madina-gateway/app/proto/urgence.proto'
COPY app/proto/urgence.proto /app/proto/urgence.proto

# 2. Create the directory where generated code will live
RUN mkdir /app/generated_code
RUN touch /app/generated_code/__init__.py

# 3. Generate the Python code from the proto file
# This command creates 'urgence_pb2.py' and 'urgence_pb2_grpc.py'
RUN python -m grpc_tools.protoc \
    -I/app/proto \
    --python_out=/app/generated_code \
    --grpc_python_out=/app/generated_code \
    /app/proto/urgence.proto

# 4. Add the generated code to the Python Path
# Fixed: Removed ${PYTHONPATH} to avoid "undefined variable" warning
ENV PYTHONPATH="/app/generated_code"

# --- APPLICATION SETUP ---
# Copy the source code (main.py, etc)
COPY app .

# Expose port 8000
EXPOSE 8000

# Start the Gateway
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]