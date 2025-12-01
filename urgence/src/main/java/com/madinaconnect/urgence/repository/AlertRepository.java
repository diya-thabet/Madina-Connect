package com.madinaconnect.urgence.repository;

import com.madinaconnect.urgence.model.AlertEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<AlertEntity, String> {
    // Custom finder to filter by type
    List<AlertEntity> findByType(String type);
}