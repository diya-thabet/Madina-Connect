# 🏙️ Service 3: Citizen Engagement (GraphQL)

## 📌 Overview
The **Madina Citizen Engagement Service** is a flexible API designed to empower citizens by allowing them to discover city events and report urban issues (e.g., potholes, broken lights).

It uses **GraphQL** to allow clients (Web/Mobile) to request exactly the data they need, avoiding over-fetching. It is backed by a persistent **H2 Database** and pre-loaded with realistic Tunisian context data.

### 🎯 Key Features
* **Protocol:** GraphQL (Schema-First Design).
* **Flexible Queries:** Clients can request specific fields (e.g., just event titles or full report details).
* **Mutations:** Citizens can create reports; Admins can update status.
* **Filtering:** Advanced filtering by Category and Status.
* **Storage:** Embedded **H2 Database** with Spring Data JPA.
* **Tech Stack:** Java 17, Spring Boot 3, Spring for GraphQL.
* **Deployment:** Google Distroless Container (Security Hardened).

---

## 🏗️ Architecture

### GraphQL Schema Design
The service is defined by a typed schema (`schema.graphqls`) that connects:
* **Events:** Cultural, Sports, and Tech gatherings.
* **Reports:** Citizen-submitted infrastructure issues.

### Data Flow
1. **Client** sends a POST request with a GraphQL Query/Mutation.
2. **Controller** maps the operation to a specific Resolver.
3. **Repository** fetches/saves data from the H2 Database using JPA.
4. **Response** is returned in the exact shape requested by the client.

---

## 🚀 How to Run (Docker)

### Prerequisites
* Docker Engine installed.
* Port **8082** available.

### 1. Build the Docker Image
Navigate to the `citizen-service` folder and run:

```bash
docker build -t madina-citizen .