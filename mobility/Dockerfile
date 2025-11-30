# --- STAGE 1: BUILDER (Standard Python) ---
# We use a standard image to build/compile dependencies because Distroless cannot 'pip install'
FROM python:3.11-slim-bookworm AS builder

WORKDIR /build

# Install dependencies into a specific directory (/build/site-packages)
# Updated to point to the file inside the 'mobility' folder
COPY mobility/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --target /build/site-packages -r requirements.txt

# --- STAGE 2: RUNTIME (Distroless) ---
# This is the "Pro" part. Contains ONLY python, no shell, no bloat.
FROM gcr.io/distroless/python3-debian12

# 1. Copy the installed python packages from the builder
COPY --from=builder /build/site-packages /usr/lib/python3.11/site-packages

# 2. Copy your application code
WORKDIR /app
# Updated to point to the file inside the 'mobility' folder
COPY mobility/mobility_service.py /app/mobility_service.py

# 3. Set the python path so it finds the installed packages
ENV PYTHONPATH=/usr/lib/python3.11/site-packages

# 4. Expose the port
EXPOSE 8000

# 5. Run the app using 'python -m uvicorn'
# We cannot use 'uvicorn' directly as a command because the binary is not in the system PATH in distroless
ENTRYPOINT ["python", "-m", "uvicorn", "mobility_service:app", "--host", "0.0.0.0", "--port", "8000"]