package com.kretea.trends.dto;

import lombok.Data;

import java.util.List;

@Data
public class TrendIngestRequest {
    private String sourceUrl;
    private String imageUrl;
    private List<String> styleTags;
    private List<String> primaryColors;
}
