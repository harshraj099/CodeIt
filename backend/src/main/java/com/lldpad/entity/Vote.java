package com.lldpad.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("votes")
@CompoundIndexes({
        @CompoundIndex(name = "user_target", def = "{'userId': 1, 'targetType': 1, 'targetId': 1}", unique = true),
        @CompoundIndex(name = "target", def = "{'targetType': 1, 'targetId': 1}")
})
public class Vote {

    @Id
    private String id;

    private String userId;

    // "discussion" | "comment"
    private String targetType;

    private String targetId;

    // +1 or -1
    private int value;

    @CreatedDate
    private Instant createdAt;

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }
    public Instant getCreatedAt() { return createdAt; }
}
