package me.carey.internet_opinion_backend.model;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "mentions")
public class Mention {

    @Id
    private String id;

    private String brand;
    private String text;
    private String source;
    private String url;

    @Column(name = "sentiment_label")
    private String sentimentLabel;

    @Column(name = "sentiment_score")
    private Double sentimentScore;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}