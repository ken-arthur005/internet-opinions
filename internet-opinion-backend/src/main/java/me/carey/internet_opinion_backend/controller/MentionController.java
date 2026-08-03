package me.carey.internet_opinion_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import me.carey.internet_opinion_backend.model.Mention;
import me.carey.internet_opinion_backend.service.MentionService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MentionController {

    @Autowired
    private MentionService mentionService;

    @GetMapping("/mentions")
    public List<Mention> getMentions(@RequestParam String brand) {
        return mentionService.getMentions(brand);
    }

    @GetMapping("/sentiment-summary")
    public Map<String, Object> getSentimentSummary(@RequestParam String brand) {
        return mentionService.getSentimentSummary(brand);
    }

    @PostMapping("/collect")
    public Map<String, String> collect(@RequestParam String brand) {
        mentionService.collectMentions(brand);
        return Map.of("status", "success", "brand", brand);
    }
}