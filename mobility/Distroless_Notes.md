How to Build and Run (Pro Workflow)

1. Build the minimal image:

docker build -t mobility-service:distroless .


2. Run it:

docker run -d -p 8000:8000 --name mobility-app madina-connect-mobility:latest

Why this is perfect:

Size: The final image will be roughly 70-100MB (mostly Python runtime) compared to 200MB-1GB for standard images.

Security: If you try docker exec -it mobility-app /bin/bash, it will fail. This is a feature, not a bug. It means attackers have no shell to work with.

Pathing: We manually set PYTHONPATH so Python knows exactly where we dumped the libraries from the builder stage.