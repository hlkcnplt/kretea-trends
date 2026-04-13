package com.kretea.trends.controller;

import com.kretea.trends.dto.TrendIngestRequest;
import com.kretea.trends.model.Trend;
import com.kretea.trends.repository.TrendRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/trends")
public class TrendController {

    private final TrendRepository trendRepository;

    public TrendController(TrendRepository trendRepository) {
        this.trendRepository = trendRepository;
    }

    @PostMapping("/ingest")
    @CacheEvict(value = "trends", allEntries = true)
    public ResponseEntity<Trend> ingestTrend(@RequestBody TrendIngestRequest request) {
        if (trendRepository.existsBySourceUrl(request.getSourceUrl())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Trend trend = Trend.builder()
                .sourceUrl(request.getSourceUrl())
                .imageUrl(request.getImageUrl())
                .styleTags(request.getStyleTags())
                .primaryColors(request.getPrimaryColors())
                .build();

        Trend savedTrend = trendRepository.save(trend);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTrend);
    }

    @GetMapping
    @Cacheable(value = "trends")
    public ResponseEntity<Page<Trend>> getTrends(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Trend> trends = trendRepository.findAll(pageable);
        return ResponseEntity.ok(trends);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Trend>> searchTrendsByTag(
            @RequestParam String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Trend> trends = trendRepository.findByStyleTagsContaining(tag, pageable);
        return ResponseEntity.ok(trends);
    }
}
