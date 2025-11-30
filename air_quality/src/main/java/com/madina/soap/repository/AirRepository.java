package com.madina.soap.repository;

import com.madina.soap.model.AirData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AirRepository extends JpaRepository<AirData, String> {
    Optional<AirData> findByZoneIgnoreCase(String zone);
}