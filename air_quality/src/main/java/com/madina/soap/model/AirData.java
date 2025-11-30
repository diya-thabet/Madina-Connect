package com.madina.soap.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "air_quality")
public class AirData {

    @Id
    private String zone; // e.g., "Tunis-Centre", "Sfax-Port"

    private int aqi;
    private String status;
    private double pm10;
    private double pm25;
    private double no2;
    private double co2;
    private double o3;

    public AirData() {}

    public AirData(String zone, int aqi, String status, double pm10, double pm25, double no2, double co2, double o3) {
        this.zone = zone;
        this.aqi = aqi;
        this.status = status;
        this.pm10 = pm10;
        this.pm25 = pm25;
        this.no2 = no2;
        this.co2 = co2;
        this.o3 = o3;
    }

    // Getters
    public String getZone() { return zone; }
    public int getAqi() { return aqi; }
    public String getStatus() { return status; }
    public double getPm10() { return pm10; }
    public double getPm25() { return pm25; }
    public double getNo2() { return no2; }
    public double getCo2() { return co2; }
    public double getO3() { return o3; }
}