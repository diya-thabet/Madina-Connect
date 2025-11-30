package com.madina.citizen.model;

import jakarta.persistence.*;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String date;
    private String location;
    private String category;
    private String organizer;
    private Boolean isFree;

    public Event() {}

    public Event(String title, String description, String date, String location, String category, String organizer, Boolean isFree) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.category = category;
        this.organizer = organizer;
        this.isFree = isFree;
    }

    // Getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDate() { return date; }
    public String getLocation() { return location; }
    public String getCategory() { return category; }
    public String getOrganizer() { return organizer; }
    public Boolean getIsFree() { return isFree; }
}