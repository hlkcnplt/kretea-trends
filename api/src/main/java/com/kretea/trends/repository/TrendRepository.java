package com.kretea.trends.repository;

import com.kretea.trends.model.Trend;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TrendRepository extends JpaRepository<Trend, UUID> {
    
    boolean existsBySourceUrl(String sourceUrl);
    
    Page<Trend> findByStyleTagsContaining(String tag, Pageable pageable);
}
