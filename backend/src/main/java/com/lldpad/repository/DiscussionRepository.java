package com.lldpad.repository;

import com.lldpad.entity.Discussion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DiscussionRepository extends MongoRepository<Discussion, String> {

    List<Discussion> findByProblemIdOrderByCreatedAtDesc(String problemId);
}
