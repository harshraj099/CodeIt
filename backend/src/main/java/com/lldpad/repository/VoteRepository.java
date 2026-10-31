package com.lldpad.repository;

import com.lldpad.entity.Vote;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface VoteRepository extends MongoRepository<Vote, String> {

    Optional<Vote> findByUserIdAndTargetTypeAndTargetId(String userId, String targetType, String targetId);

    List<Vote> findByTargetTypeAndTargetId(String targetType, String targetId);

    List<Vote> findByTargetTypeAndTargetIdIn(String targetType, Collection<String> targetIds);
}
