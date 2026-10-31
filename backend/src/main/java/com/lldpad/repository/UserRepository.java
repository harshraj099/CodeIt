package com.lldpad.repository;

import com.lldpad.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findFirstByEmailOrUsername(String email, String username);
}
