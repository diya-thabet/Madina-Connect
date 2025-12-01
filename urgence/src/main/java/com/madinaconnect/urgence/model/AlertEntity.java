package com.madinaconnect.urgence.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String type; // ACCIDENT, FIRE, etc.

    private double latitude;
    private double longitude;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    private LocalDateTime timestamp;
}