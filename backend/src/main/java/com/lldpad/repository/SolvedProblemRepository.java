package com.lldpad.repository;

import com.lldpad.entity.SolvedProblem;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SolvedProblemRepository extends MongoRepository<SolvedProblem, String> {

    boolean existsByUserIdAndProblemId(String userId, String problemId);
}
