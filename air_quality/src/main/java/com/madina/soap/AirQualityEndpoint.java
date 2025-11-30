package com.madina.soap;

import com.madina.soap.airquality.GetAirQualityRequest;
import com.madina.soap.airquality.GetAirQualityResponse;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

@Endpoint
public class AirQualityEndpoint {

    private static final String NAMESPACE_URI = "http://madina.com/soap/airquality";

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getAirQualityRequest")
    @ResponsePayload
    public GetAirQualityResponse getAirQuality(@RequestPayload GetAirQualityRequest request) {
        GetAirQualityResponse response = new GetAirQualityResponse();

        String zone = request.getZone() != null ? request.getZone().toLowerCase() : "";

        // Simulating data based on the city zone
        if (zone.contains("industrial") || zone.contains("factory")) {
            // High Pollution
            response.setAqi(158);
            response.setStatus("Unhealthy");
            response.setPm10(85.0);
            response.setPm25(60.2);
            response.setNo2(120.5); // High Nitrogen from factories
            response.setCo2(450.0);
            response.setO3(40.1);
        } else if (zone.contains("park") || zone.contains("garden")) {
            // Very Clean
            response.setAqi(25);
            response.setStatus("Good");
            response.setPm10(12.0);
            response.setPm25(5.5);
            response.setNo2(10.1);
            response.setCo2(405.0); // Normal CO2 levels
            response.setO3(25.0);
        } else if (zone.contains("downtown") || zone.contains("center")) {
            // Traffic Pollution
            response.setAqi(85);
            response.setStatus("Moderate");
            response.setPm10(45.0);
            response.setPm25(22.5);
            response.setNo2(65.0); // Traffic causes NO2
            response.setCo2(420.0);
            response.setO3(35.5);
        } else {
            // Default / Unknown Zone
            response.setAqi(50);
            response.setStatus("Fair");
            response.setPm10(20.0);
            response.setPm25(10.0);
            response.setNo2(15.0);
            response.setCo2(410.0);
            response.setO3(30.0);
        }

        return response;
    }
}