package com.madina.citizen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String description;
    private String location;
    private String category;
    private String reporterName;
    private String status;
    private String timestamp;

    public Report() {}

    public Report(String description, String location, String category, String reporterName) {
        this.description = description;
        this.location = location;
        this.category = category;
        this.reporterName = reporterName;
        this.status = "PENDING";
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }

    // Setters for updates
    public void setStatus(String status) {
        this.status = status;
    }

    // Getters
    public Long getId() { return id; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public String getCategory() { return category; }
    public String getReporterName() { return reporterName; }
    public String getStatus() { return status; }
    public String getTimestamp() { return timestamp; }
}