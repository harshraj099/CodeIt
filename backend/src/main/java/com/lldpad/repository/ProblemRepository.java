package com.lldpad.repository;

import com.lldpad.entity.Problem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProblemRepository extends MongoRepository<Problem, String> {

    Optional<Problem> findBySlug(String slug);
}
