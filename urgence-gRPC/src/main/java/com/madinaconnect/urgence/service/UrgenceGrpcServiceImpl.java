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

@GrpcService
public class UrgenceGrpcServiceImpl extends UrgenceServiceGrpc.UrgenceServiceImplBase {

    @Autowired
    private AlertRepository alertRepository;

    // --- 1. UNARY (Existing) ---
    @Override
    public void createAlert(AlertRequest request, StreamObserver<AlertResponse> responseObserver) {
        AlertEntity entity = saveAlertToDb(request);
        responseObserver.onNext(mapToResponse(entity));
        responseObserver.onCompleted();
    }

    @Override
    public void getAlert(GetAlertRequest request, StreamObserver<AlertResponse> responseObserver) {
        alertRepository.findById(request.getAlertId()).ifPresentOrElse(
                entity -> {
                    responseObserver.onNext(mapToResponse(entity));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(Status.NOT_FOUND.withDescription("Alert not found").asRuntimeException())
        );
    }

    @Override
    public void updateAlertStatus(UpdateStatusRequest request, StreamObserver<AlertResponse> responseObserver) {
        alertRepository.findById(request.getAlertId()).ifPresentOrElse(
                entity -> {
                    entity.setStatus(AlertStatus.valueOf(request.getNewStatus()));
                    alertRepository.save(entity);
                    responseObserver.onNext(mapToResponse(entity));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(Status.NOT_FOUND.asRuntimeException())
        );
    }

    // --- 2. SERVER STREAMING (Existing) ---
    @Override
    public void listAlerts(ListAlertsRequest request, StreamObserver<AlertResponse> responseObserver) {
        var alerts = request.getTypeFilter().isEmpty() ? alertRepository.findAll() : alertRepository.findByType(request.getTypeFilter());
        alerts.forEach(entity -> responseObserver.onNext(mapToResponse(entity)));
        responseObserver.onCompleted();
    }

    // --- 3. CLIENT STREAMING (New!) ---
    @Override
    public StreamObserver<AlertRequest> batchCreateAlerts(StreamObserver<BatchSummary> responseObserver) {
        return new StreamObserver<AlertRequest>() {
            int count = 0;

            @Override
            public void onNext(AlertRequest request) {
                // Keep receiving alerts one by one and saving them
                saveAlertToDb(request);
                count++;
                System.out.println("Batch received alert #" + count);
            }

            @Override
            public void onError(Throwable t) {
                System.err.println("Error in batch upload: " + t.getMessage());
            }

            @Override
            public void onCompleted() {
                // Client is done sending. We send ONE summary response.
                BatchSummary summary = BatchSummary.newBuilder()
                        .setAlertCount(count)
                        .setStatusMessage("Succès! " + count + " alertes enregistrées.")
                        .build();
                responseObserver.onNext(summary);
                responseObserver.onCompleted();
            }
        };
    }

    // --- 4. BIDIRECTIONAL STREAMING (New!) ---
    @Override
    public StreamObserver<ChatMessage> liveChat(StreamObserver<ChatMessage> responseObserver) {
        return new StreamObserver<ChatMessage>() {
            @Override
            public void onNext(ChatMessage incomingMsg) {
                System.out.println("Chat from CIN " + incomingMsg.getSenderCin() + ": " + incomingMsg.getMessage());

                // Simulate Operator Typing Back
                String replyText = "Protection Civile: Reçu " + incomingMsg.getMessage() + ". Calmez-vous.";

                if(incomingMsg.getMessage().contains("feu")) {
                    replyText = "Protection Civile: ALERTE FEU! Les pompiers arrivent!";
                }

                ChatMessage reply = ChatMessage.newBuilder()
                        .setSenderCin("00000000") // Operator ID
                        .setMessage(replyText)
                        .setTimestamp(LocalDateTime.now().toString())
                        .build();

                // Send the reply back immediately
                responseObserver.onNext(reply);
            }

            @Override
            public void onError(Throwable t) {
                System.err.println("Chat disconnected");
            }

            @Override
            public void onCompleted() {
                responseObserver.onCompleted(); // End chat
            }
        };
    }

    // --- Helpers ---
    private AlertEntity saveAlertToDb(AlertRequest request) {
        AlertEntity entity = new AlertEntity();
        entity.setType(request.getType());
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        entity.setDescription(request.getDescription());
        entity.setSenderCin(request.getSenderCin());
        entity.setStatus(AlertStatus.PENDING);
        entity.setTimestamp(LocalDateTime.now());
        return alertRepository.save(entity);
    }

    private AlertResponse mapToResponse(AlertEntity entity) {
        return AlertResponse.newBuilder()
                .setAlertId(entity.getId())
                .setType(entity.getType())
                .setLatitude(entity.getLatitude())
                .setLongitude(entity.getLongitude())
                .setDescription(entity.getDescription() != null ? entity.getDescription() : "")
                .setStatus(entity.getStatus().name())
                .setSenderCin(entity.getSenderCin() != null ? entity.getSenderCin() : "")
                .setReceivedTimestamp(entity.getTimestamp().toString())
                .build();
    }
}