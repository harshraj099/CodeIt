package com.lldpad.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("comments")
public class Comment {

    @Id
    private String id;

    @Indexed
    private String discussionId;

    private String userId;

    // null for top-level comments
    private String parentId;

    private String content;

    private int upvotes;

    private int downvotes;

    @CreatedDate
    private Instant createdAt;

    public String getId() { return id; }
    public String getDiscussionId() { return discussionId; }
    public void setDiscussionId(String discussionId) { this.discussionId = discussionId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }
    public int getDownvotes() { return downvotes; }
    public void setDownvotes(int downvotes) { this.downvotes = downvotes; }
    public Instant getCreatedAt() { return createdAt; }
}
