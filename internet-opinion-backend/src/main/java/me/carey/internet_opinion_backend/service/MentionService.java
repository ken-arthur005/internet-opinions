package me.carey.internet_opinion_backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import me.carey.internet_opinion_backend.model.Mention;
import me.carey.internet_opinion_backend.repository.MentionRepository;

@Service
public class MentionService {

    @Autowired
    private MentionRepository mentionRepository;

    private final WebClient webClient = WebClient.create("http://localhost:8000");

    public List<Mention> getMentions(String brand) {
        return mentionRepository.findByBrandIgnoreCase(brand);
    }
    
    public Map<String, Object> getSentimentSummary(String brand) {
        List<Mention> mentions = mentionRepository.findByBrandIgnoreCase(brand);

        long total = mentions.size();
        long positive = mentions.stream()
            .filter(m -> "POSITIVE".equalsIgnoreCase(m.getSentimentLabel()))
            .count();
        long negative = mentions.stream()
            .filter(m -> "NEGATIVE".equalsIgnoreCase(m.getSentimentLabel()))
            .count();
        long neutral = total - positive - negative;

        double avgScore = mentions.stream()
            .mapToDouble(m -> m.getSentimentScore() != null ? m.getSentimentScore() : 0)
            .average()
            .orElse(0);

        Map<String, Object> summary = new HashMap<>();
        summary.put("brand", brand);
        summary.put("total", total);
        summary.put("positive", positive);
        summary.put("negative", negative);
        summary.put("neutral", neutral);
        summary.put("averageScore", Math.round(avgScore * 100.0) / 100.0);

        return summary;
    }

    public void collectMentions(String brand) {
        Map<String, String> body = new HashMap<>();
        body.put("brand", brand);

        webClient.post()
            .uri("/collect")
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }
}