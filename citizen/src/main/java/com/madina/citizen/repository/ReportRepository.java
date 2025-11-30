package com.madina.citizen.repository;

import com.madina.citizen.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusIgnoreCase(String status);
}