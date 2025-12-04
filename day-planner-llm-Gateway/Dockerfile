# STAGE 1: Builder (Heavy image with compilers)
FROM python:3.11-slim-bookworm AS builder

WORKDIR /app

# Install system dependencies for lxml (required by Zeep)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into a specific folder to copy later
# We upgrade pip to ensure we get the latest binary wheels
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --target /app/site-packages -r requirements.txt

# STAGE 2: Runtime (Google Distroless - Secure & Tiny)
FROM gcr.io/distroless/python3-debian12

WORKDIR /app

# 1. Copy installed python packages from builder
COPY --from=builder /app/site-packages /usr/lib/python3.11/site-packages

# 2. Copy application code
COPY src /app/src

# 3. Set Python path so it finds the packages
ENV PYTHONPATH=/usr/lib/python3.11/site-packages

# 4. Expose the port
EXPOSE 8001

# 5. Run the app (Distroless entrypoint is python3, so we just pass args)
# Equivalent to: python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8001
CMD ["-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]