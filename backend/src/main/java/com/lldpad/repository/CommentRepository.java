package com.lldpad.repository;

import com.lldpad.entity.Comment;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    /** Result row of {@link #countByDiscussionIds}; {@code id} is the discussion id. */
    record DiscussionCommentCount(String id, int count) {}

    List<Comment> findByDiscussionIdOrderByCreatedAtAsc(String discussionId);

    @Aggregation(pipeline = {
            "{ $match: { discussionId: { $in: ?0 } } }",
            "{ $group: { _id: '$discussionId', count: { $sum: 1 } } }"
    })
    List<DiscussionCommentCount> countByDiscussionIds(Collection<String> discussionIds);
}
