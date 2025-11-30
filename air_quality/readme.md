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
```

## soap payload

<soapenv:Envelope xmlns:soapenv="[http://schemas.xmlsoap.org/soap/envelope/](http://schemas.xmlsoap.org/soap/envelope/)"
                  xmlns:air="[http://madina.com/soap/airquality](http://madina.com/soap/airquality)">
   <soapenv:Header/>
   <soapenv:Body>
      <air:getAirQualityRequest>
         <air:zone>industrial</air:zone>
      </air:getAirQualityRequest>
   </soapenv:Body>
</soapenv:Envelope>


## expected response
<SOAP-ENV:Envelope xmlns:SOAP-ENV="[http://schemas.xmlsoap.org/soap/envelope/](http://schemas.xmlsoap.org/soap/envelope/)">
   <SOAP-ENV:Header/>
   <SOAP-ENV:Body>
      <ns2:getAirQualityResponse xmlns:ns2="[http://madina.com/soap/airquality](http://madina.com/soap/airquality)">
         <ns2:aqi>158</ns2:aqi>
         <ns2:status>Unhealthy</ns2:status>
         <ns2:pm10>85.0</ns2:pm10>
         <ns2:pm25>60.2</ns2:pm25>
         <ns2:no2>120.5</ns2:no2>
         <ns2:co2>450.0</ns2:co2>
         <ns2:o3>40.1</ns2:o3>
      </ns2:getAirQualityResponse>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>



##Project Structure
├── src/
│   ├── main/
│   │   ├── java/       # Spring Boot Application & Endpoint Logic
│   │   └── resources/
│   │       └── air-quality.xsd  # The Source of Truth (Contract)
├── Dockerfile          # Multi-stage Distroless build
├── pom.xml             # Maven dependencies & XSD-to-Java plugin
└── README.md           # Documentation


## docs link
```bash
http://localhost:8081/ws/airQuality.wsdl
```