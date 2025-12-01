package com.madinaconnect.urgence.service;

import com.madinaconnect.urgence.grpc.*;
import com.madinaconnect.urgence.model.AlertEntity;
import com.madinaconnect.urgence.model.AlertStatus;
import com.madinaconnect.urgence.repository.AlertRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@GrpcService
public class UrgenceGrpcServiceImpl extends UrgenceServiceGrpc.UrgenceServiceImplBase {

    @Autowired
    private AlertRepository alertRepository;

    @Override
    public void createAlert(AlertRequest request, StreamObserver<AlertResponse> responseObserver) {
        AlertEntity entity = new AlertEntity();
        entity.setType(request.getType());
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        entity.setDescription(request.getDescription());
        entity.setStatus(AlertStatus.PENDING);
        entity.setTimestamp(LocalDateTime.now());

        AlertEntity saved = alertRepository.save(entity);
        System.out.println("ALERT CREATED: " + saved.getId() + " [" + saved.getType() + "]");

        responseObserver.onNext(mapToResponse(saved));
        responseObserver.onCompleted();
    }

    @Override
    public void getAlert(GetAlertRequest request, StreamObserver<AlertResponse> responseObserver) {
        Optional<AlertEntity> alertOpt = alertRepository.findById(request.getAlertId());

        if (alertOpt.isPresent()) {
            responseObserver.onNext(mapToResponse(alertOpt.get()));
            responseObserver.onCompleted();
        } else {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription("Alert with ID " + request.getAlertId() + " not found.")
                    .asRuntimeException());
        }
    }

    @Override
    public void listAlerts(ListAlertsRequest request, StreamObserver<AlertResponse> responseObserver) {
        List<AlertEntity> alerts;

        // Filter logic
        if (request.getTypeFilter() != null && !request.getTypeFilter().isEmpty()) {
            alerts = alertRepository.findByType(request.getTypeFilter());
        } else {
            alerts = alertRepository.findAll();
        }

        // Stream each alert to the client individually
        for (AlertEntity alert : alerts) {
            responseObserver.onNext(mapToResponse(alert));
        }
        responseObserver.onCompleted();
    }

    @Override
    public void updateAlertStatus(UpdateStatusRequest request, StreamObserver<AlertResponse> responseObserver) {
        Optional<AlertEntity> alertOpt = alertRepository.findById(request.getAlertId());

        if (alertOpt.isPresent()) {
            AlertEntity alert = alertOpt.get();
            try {
                // Validate enum conversion
                AlertStatus newStatus = AlertStatus.valueOf(request.getNewStatus().toUpperCase());
                alert.setStatus(newStatus);
                AlertEntity updated = alertRepository.save(alert);

                System.out.println("STATUS UPDATE: " + updated.getId() + " -> " + newStatus);

                responseObserver.onNext(mapToResponse(updated));
                responseObserver.onCompleted();
            } catch (IllegalArgumentException e) {
                responseObserver.onError(Status.INVALID_ARGUMENT
                        .withDescription("Invalid Status: " + request.getNewStatus())
                        .asRuntimeException());
            }
        } else {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription("Alert ID not found")
                    .asRuntimeException());
        }
    }

    // Helper method to map Entity -> Proto Response
    private AlertResponse mapToResponse(AlertEntity entity) {
        return AlertResponse.newBuilder()
                .setAlertId(entity.getId())
                .setType(entity.getType())
                .setLatitude(entity.getLatitude())
                .setLongitude(entity.getLongitude())
                .setDescription(entity.getDescription() != null ? entity.getDescription() : "")
                .setStatus(entity.getStatus().name())
                .setReceivedTimestamp(entity.getTimestamp().toString())
                .build();
    }
}