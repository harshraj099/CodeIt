package com.lldpad.repository;

import com.lldpad.entity.UserCode;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserCodeRepository extends MongoRepository<UserCode, String> {

    Optional<UserCode> findByUserIdAndProblemId(String userId, String problemId);
}
