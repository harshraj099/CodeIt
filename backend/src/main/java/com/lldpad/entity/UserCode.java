package com.lldpad.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("user_codes")
@CompoundIndex(name = "user_problem", def = "{'userId': 1, 'problemId': 1}", unique = true)
public class UserCode {

    @Id
    private String id;

    private String userId;

    private String problemId;

    // cpp, python, js
    private String language;

    private String code;

    @LastModifiedDate
    private Instant updatedAt;

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public Instant getUpdatedAt() { return updatedAt; }
}
