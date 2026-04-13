package com.kretea.trends.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trends")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trend {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 1000)
    private String sourceUrl;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "trend_style_tags", joinColumns = @JoinColumn(name = "trend_id"))
    @Column(name = "style_tag")
    private List<String> styleTags;

    @ElementCollection
    @CollectionTable(name = "trend_primary_colors", joinColumns = @JoinColumn(name = "trend_id"))
    @Column(name = "primary_color")
    private List<String> primaryColors;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
