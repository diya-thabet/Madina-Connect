package com.madinaconnect.urgence.controller;

import com.madinaconnect.urgence.grpc.*;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.stub.StreamObserver;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UrgenceRestGateway {

    private final UrgenceServiceGrpc.UrgenceServiceBlockingStub blockingStub;
    private final UrgenceServiceGrpc.UrgenceServiceStub asyncStub;

    // --- GEMINI CONFIGURATION (UPDATED) ---
    // Using the key and model from your working curl command
    private static final String GEMINI_API_KEY = "AIzaSyDq2Tl5BPTqhtLEslim9H-BBUIROoAdv0I";
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

    private final RestTemplate restTemplate = new RestTemplate();

    public UrgenceRestGateway() {
        // Connect to gRPC Server on port 9090
        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 9090)
                .usePlaintext()
                .build();
        this.blockingStub = UrgenceServiceGrpc.newBlockingStub(channel);
        this.asyncStub = UrgenceServiceGrpc.newStub(channel);
    }

    // --- 1. UNARY: Create One Alert ---
    @PostMapping("/alerts")
    public AlertResponseDTO createAlert(@RequestBody AlertRequestDTO dto) {
        AlertResponse response = blockingStub.createAlert(mapToRequest(dto));
        return mapToResponseDTO(response);
    }

    // --- 2. SERVER STREAMING: List All ---
    @GetMapping("/alerts")
    public List<AlertResponseDTO> listAlerts(@RequestParam(defaultValue = "") String type) {
        ListAlertsRequest request = ListAlertsRequest.newBuilder().setTypeFilter(type).build();
        Iterator<AlertResponse> responseIterator = blockingStub.listAlerts(request);

        List<AlertResponseDTO> alerts = new ArrayList<>();
        responseIterator.forEachRemaining(grpcObj -> alerts.add(mapToResponseDTO(grpcObj)));
        return alerts;
    }

    // --- 3. UNARY: Update Status ---
    @PutMapping("/alerts/{id}/status")
    public AlertResponseDTO updateStatus(@PathVariable String id, @RequestBody String status) {
        UpdateStatusRequest request = UpdateStatusRequest.newBuilder()
                .setAlertId(id)
                .setNewStatus(status)
                .build();
        return mapToResponseDTO(blockingStub.updateAlertStatus(request));
    }

    // --- 4. CLIENT STREAMING: Batch Upload ---
    @PostMapping("/alerts/batch")
    public BatchSummaryDTO batchUpload(@RequestBody List<AlertRequestDTO> dtos) throws InterruptedException, ExecutionException, TimeoutException {
        CompletableFuture<BatchSummaryDTO> future = new CompletableFuture<>();

        StreamObserver<AlertRequest> requestStream = asyncStub.batchCreateAlerts(new StreamObserver<>() {
            @Override
            public void onNext(BatchSummary summary) {
                BatchSummaryDTO dto = new BatchSummaryDTO();
                dto.alertCount = summary.getAlertCount();
                dto.statusMessage = summary.getStatusMessage();
                future.complete(dto);
            }
            @Override
            public void onError(Throwable t) { future.completeExceptionally(t); }
            @Override
            public void onCompleted() {}
        });

        for (AlertRequestDTO dto : dtos) {
            requestStream.onNext(mapToRequest(dto));
        }
        requestStream.onCompleted();

        return future.get(10, TimeUnit.SECONDS);
    }

    // --- 5. BIDIRECTIONAL STREAMING: Chat WITH GEMINI AI ---
    @PostMapping("/chat")
    public ChatMessageDTO sendChat(@RequestBody ChatMessageDTO msg) throws InterruptedException, ExecutionException, TimeoutException {

        // 1. Ask Gemini for a "Calming Response" immediately
        String aiResponse = callGeminiAI(msg.message);

        CompletableFuture<ChatMessageDTO> future = new CompletableFuture<>();

        // 2. Send to gRPC (simulating backend log)
        StreamObserver<ChatMessage> requestStream = asyncStub.liveChat(new StreamObserver<>() {
            @Override
            public void onNext(ChatMessage reply) {
                ChatMessageDTO dto = new ChatMessageDTO();
                dto.senderCin = reply.getSenderCin();
                // Inject AI response
                dto.message = aiResponse;
                dto.timestamp = reply.getTimestamp();
                future.complete(dto);
            }
            @Override
            public void onError(Throwable t) { future.completeExceptionally(t); }
            @Override
            public void onCompleted() {}
        });

        requestStream.onNext(ChatMessage.newBuilder()
                .setSenderCin(msg.senderCin)
                .setMessage(msg.message)
                .setTimestamp(java.time.LocalDateTime.now().toString())
                .build());

        return future.get(5, TimeUnit.SECONDS);
    }

    // --- GEMINI AI HELPER METHOD ---
    private String callGeminiAI(String userMessage) {
        try {
            String prompt = "(always answer by the language of the user promt , don't mix)You are a Tunisian emergency dispatcher. The caller is panicked. Respond with one calm, clear sentence that reassures them and gives the most immediate safe action they should take. Do NOT ask questions. Do NOT request more information and always said your location is registered we are coming now (after your reply). if the user thanked you or asked something always answer good general answers because you don't have the history of the messages he sended , keep it in a way like its continious conversation. Caller said:\n" + userMessage;

            // Safe JSON construction
            String safePrompt = prompt.replace("\"", "'").replace("\n", " ");
            String requestBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \"" + safePrompt + "\" }] }] }";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // Call Google API
            ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL, entity, Map.class);

            // Extract text from JSON response
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("🔴 GEMINI API ERROR: " + e.getStatusCode());
            System.err.println("🔴 DETAILS: " + e.getResponseBodyAsString());
            return "Help is on the way. (AI Error: " + e.getStatusCode() + ")";
        } catch (Exception e) {
            System.err.println("🔴 GENERAL ERROR: " + e.getMessage());
            return "Help is on the way. (Connection Error)";
        }
        return "Help is on the way.";
    }

    // ==========================================
    // HELPERS & DTOs
    // ==========================================

    private AlertResponseDTO mapToResponseDTO(AlertResponse grpc) {
        AlertResponseDTO dto = new AlertResponseDTO();
        dto.alertId = grpc.getAlertId();
        dto.type = grpc.getType();
        dto.latitude = grpc.getLatitude();
        dto.longitude = grpc.getLongitude();
        dto.description = grpc.getDescription();
        dto.status = grpc.getStatus();
        dto.receivedTimestamp = grpc.getReceivedTimestamp();
        dto.senderCin = grpc.getSenderCin();
        return dto;
    }

    private AlertRequest mapToRequest(AlertRequestDTO dto) {
        return AlertRequest.newBuilder()
                .setType(dto.type)
                .setLatitude(dto.latitude)
                .setLongitude(dto.longitude)
                .setDescription(dto.description)
                .setSenderCin(dto.senderCin)
                .build();
    }

    public static class AlertRequestDTO {
        public String type;
        public double latitude;
        public double longitude;
        public String description;
        public String senderCin;
    }

    public static class AlertResponseDTO {
        public String alertId;
        public String type;
        public double latitude;
        public double longitude;
        public String description;
        public String status;
        public String receivedTimestamp;
        public String senderCin;
    }

    public static class BatchSummaryDTO {
        public int alertCount;
        public String statusMessage;
    }

    public static class ChatMessageDTO {
        public String senderCin;
        public String message;
        public String timestamp;
    }
}