package com.madina.citizen.controller;

import com.madina.citizen.model.Event;
import com.madina.citizen.model.Report;
import com.madina.citizen.repository.EventRepository;
import com.madina.citizen.repository.ReportRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
public class CitizenController {

    private final EventRepository eventRepository;
    private final ReportRepository reportRepository;

    public CitizenController(EventRepository eventRepository, ReportRepository reportRepository) {
        this.eventRepository = eventRepository;
        this.reportRepository = reportRepository;
    }

    // --- QUERIES ---

    @QueryMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @QueryMapping
    public Event getEventById(@Argument Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Event> getEventsByCategory(@Argument String category) {
        return eventRepository.findByCategoryIgnoreCase(category);
    }

    @QueryMapping
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @QueryMapping
    public Report getReportById(@Argument Long id) {
        return reportRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Report> getReportsByStatus(@Argument String status) {
        return reportRepository.findByStatusIgnoreCase(status);
    }

    // --- MUTATIONS ---

    @MutationMapping
    public Report createReport(@Argument String description, @Argument String location,
                               @Argument String category, @Argument String reporterName) {
        Report report = new Report(description, location, category, reporterName);
        return reportRepository.save(report);
    }

    @MutationMapping
    public Report updateReportStatus(@Argument Long id, @Argument String status) {
        Optional<Report> optionalReport = reportRepository.findById(id);
        if (optionalReport.isPresent()) {
            Report report = optionalReport.get();
            report.setStatus(status);
            return reportRepository.save(report);
        }
        return null; // Handle error gracefully in real app
    }

    @MutationMapping
    public Boolean deleteReport(@Argument Long id) {
        if (reportRepository.existsById(id)) {
            reportRepository.deleteById(id);
            return true;
        }
        return false;
    }
}