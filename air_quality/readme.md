# ☁️ Service 2: Air Quality Monitoring (SOAP)

## 📌 Overview
This service is a critical component of the **Madina Smart City Platform**. It provides a robust, standardized interface for retrieving environmental data using the **SOAP (Simple Object Access Protocol)** standard.

It adheres to a **Contract-First** design approach, ensuring strict type safety and interoperability across legacy and modern systems.

### 🎯 Key Features
* **Protocol:** SOAP 1.1 (WSDL/XSD based).
* **Architecture:** Contract-First (XSD defines the model).
* **Data Points:** AQI, PM2.5, PM10, NO₂, CO₂, O₃.
* **Tech Stack:** Java 17, Spring Boot 3, Spring Web Services.
* **Deployment:** Google Distroless Container (Security Hardened).

---

## 🏗️ Architecture & Design

### Contract-First Development
The data structure is defined in `src/main/resources/air-quality.xsd` before any code is written. This guarantees that the implementation strictly follows the service definition.

**Pollutants Monitored:**
1.  **NO₂ (Nitrogen Dioxide):** Indicator of traffic pollution.
2.  **CO₂ (Carbon Dioxide):** General industrial/urban emission.
3.  **O₃ (Ozone):** Ground-level smog indicator.
4.  **PM2.5/PM10:** Fine particulate matter.

---

## 🚀 How to Run (Docker)

This service is packaged as a **Distroless** Docker container to minimize attack surface (no shell, no package manager).

### Prerequisites
* Docker Engine installed.
* Port **8081** available.

### Build & Run
```bash
# 1. Build the Docker Image
docker build -t madina-soap .

# 2. Start the Service
# Maps container port 8080 -> Host port 8081
docker run -d -p 8081:8080 --name soap-app madina-soap