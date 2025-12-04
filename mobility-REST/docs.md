# 🚌 Service 1: Smart Mobility (REST)

## 📌 Overview
The **Madina Smart City Mobility Service** is a high-performance, containerized RESTful API designed to manage and expose real-time public transport data for the city of Tunis. It serves as the backbone for citizen mobility apps, providing schedules, traffic disruptions, and interconnection data.

Built with **FastAPI** (Python) and **SQLite**, it follows a **Distroless** container architecture to ensure maximum security, a minimal footprint (~90MB), and high velocity.

### 🎯 Key Features
* **🇹🇳 Real-time Tunisian Data:** Pre-loaded with authentic data for TGM, Transtu Metro (Lines 1-6), SNCFT, and RFR.
* **📅 Live Schedules:** Exact departure times and directions for all lines.
* **⚠️ Traffic Alerts:** Real-time reporting of delays, accidents, and cancellations.
* **🔄 Interconnections:** Smart hub mapping (e.g., "Barcelona" connects Metro, Train, and Bus).
* **🛠 Full CRUD Management:** Admin API to dynamically add/remove lines, update schedules, and manage incidents.
* **💾 Persistent Storage:** Embedded **SQLite** database with automatic schema generation and data injection.
* **🔒 Security:** Runs in a **Distroless** Docker container (No shell, no root privileges).
* **📄 Interactive Documentation:** Auto-generated Swagger UI & ReDoc.

---

## 🛠️ Tech Stack

| Component | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Framework** | **FastAPI** | 0.100+ | Modern, high-performance Python web framework. |
| **Database** | **SQLite** | 3.x | Serverless, file-based relational database. |
| **ORM** | **SQLAlchemy** | 2.0 | Modern Python SQL toolkit and Object Relational Mapper. |
| **Validation** | **Pydantic** | V2 | Data validation using Python type hints. |
| **Server** | **Uvicorn** | Standard | Lightning-fast ASGI server implementation. |
| **Container** | **Distroless** | Debian 12 | Google's minimal base image (Python 3.11). |

---

## 🏗️ Architecture

The service implements a **Layered Architecture** to ensure separation of concerns:

1.  **Presentation Layer (API):**
    * **FastAPI Routes:** Handles HTTP methods (GET, POST, PUT, DELETE).
    * **Pydantic Models:** Validates incoming JSON and serializes outgoing responses.
2.  **Service Layer (Business Logic):**
    * **Lifespan Manager:** Handles startup logic, database initialization, and data injection.
    * **Traffic Logic:** Associates real-time alerts with specific transport lines.
3.  **Data Persistence Layer:**
    * **SQLAlchemy ORM:** Maps Python classes (`TransportLineDB`, `ScheduleDB`) to SQLite tables.
    * **SQLite File:** Data is stored in `mobility.db` within the container.

---

## 🚀 How to Run (Docker)

This project uses a **Multi-Stage Docker Build** to compile dependencies in a standard environment before copying them into a secure, stripped-down runtime.

### Prerequisites
* Docker Engine installed.
* Port **8000** available.

### 1. Build the Docker Image
Navigate to the project root and run:

```bash
docker build -t madina-mobility:latest .