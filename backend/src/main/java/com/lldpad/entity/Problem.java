package com.lldpad.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/** The stored copy of a catalog problem, holding the test cases used by /api/verify. */
@Document("problems")
public class Problem {

    @Id
    private String id;

    private String title;

    @Indexed(unique = true)
    private String slug;

    private String difficulty;

    private String description;

    private List<String> inputCases;

    private List<String> outputCases;

    @CreatedDate
    private Instant createdAt;

    public String getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getInputCases() { return inputCases; }
    public void setInputCases(List<String> inputCases) { this.inputCases = inputCases; }
    public List<String> getOutputCases() { return outputCases; }
    public void setOutputCases(List<String> outputCases) { this.outputCases = outputCases; }
    public Instant getCreatedAt() { return createdAt; }
}
