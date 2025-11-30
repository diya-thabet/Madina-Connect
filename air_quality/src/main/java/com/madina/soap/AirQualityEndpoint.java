package com.madina.soap;

import com.madina.soap.airquality.*;
import com.madina.soap.model.AirData;
import com.madina.soap.repository.AirRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

@Endpoint
public class AirQualityEndpoint {

    private static final String NAMESPACE_URI = "http://madina.com/soap/airquality";

    @Autowired
    private AirRepository repository;

    // --- Operation 1: Get Single Zone ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getAirQualityRequest")
    @ResponsePayload
    public GetAirQualityResponse getAirQuality(@RequestPayload GetAirQualityRequest request) {
        GetAirQualityResponse response = new GetAirQualityResponse();

        String requestedZone = request.getZone().trim();
        AirData data = repository.findByZoneIgnoreCase(requestedZone)
                .orElse(createDefaultData(requestedZone)); // Fallback if not found

        response.setData(mapEntityToSoap(data));
        return response;
    }

    // --- Operation 2: Compare Two Zones ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "compareZonesRequest")
    @ResponsePayload
    public CompareZonesResponse compareZones(@RequestPayload CompareZonesRequest request) {
        CompareZonesResponse response = new CompareZonesResponse();

        AirData d1 = repository.findByZoneIgnoreCase(request.getZone1())
                .orElse(createDefaultData(request.getZone1()));
        AirData d2 = repository.findByZoneIgnoreCase(request.getZone2())
                .orElse(createDefaultData(request.getZone2()));

        response.setResultZone1(mapEntityToSoap(d1));
        response.setResultZone2(mapEntityToSoap(d2));

        // Logic to generate comparison text
        if (d1.getAqi() < d2.getAqi()) {
            response.setAnalysis(d1.getZone() + " has better air quality than " + d2.getZone());
        } else if (d1.getAqi() > d2.getAqi()) {
            response.setAnalysis(d2.getZone() + " has better air quality than " + d1.getZone());
        } else {
            response.setAnalysis("Both zones have similar air quality.");
        }

        return response;
    }

    // Helper: Map Database Entity to SOAP generated class
    private AirQualityData mapEntityToSoap(AirData entity) {
        AirQualityData soapData = new AirQualityData();
        soapData.setZone(entity.getZone());
        soapData.setAqi(entity.getAqi());
        soapData.setStatus(entity.getStatus());
        soapData.setPm10(entity.getPm10());
        soapData.setPm25(entity.getPm25());
        soapData.setNo2(entity.getNo2());
        soapData.setCo2(entity.getCo2());
        soapData.setO3(entity.getO3());
        return soapData;
    }

    // Helper: Default data if zone not found in DB
    private AirData createDefaultData(String zone) {
        return new AirData(zone + " (Unknown)", 0, "No Data", 0, 0, 0, 0, 0);
    }
}