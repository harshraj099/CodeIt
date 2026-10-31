package com.lldpad.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("solved_problems")
@CompoundIndex(name = "user_problem", def = "{'userId': 1, 'problemId': 1}", unique = true)
public class SolvedProblem {

    @Id
    private String id;

    private String userId;

    private String problemId;

    @CreatedDate
    private Instant solvedAt;

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public Instant getSolvedAt() { return solvedAt; }
}
